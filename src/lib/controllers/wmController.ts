import type { ApiWrapper } from "$lib/apiWrapper";
import type { CommandApi } from "$lib/commandApis/commandApi";
import { CommandApiProxyWM } from "$lib/commandApis/commandApiProxyWM";
import { Meta } from "$lib/nswagclient";
import type { Cmd, Hilite, Sleep, Enable, Text } from "$lib/presentationCommands";
import { SignalX1, SignalX1Public } from "$lib/signals";

export interface GameController {
    init(onFinished?: (() => void) | null): Promise<void>;
    start(): Promise<boolean>;

    get levelUpdateSignal(): SignalX1Public<UpdateLevelArgs>;
    get progressUpdateSignal(): SignalX1Public<UpdateProgressArgs>;
    get showTextSignal(): SignalX1Public<ShowTextArgs>;
    get hiliteSignal(): SignalX1Public<HiliteArgs>;
    get addItemSignal(): SignalX1Public<AddItemArgs>;
    get enableSignal() : SignalX1Public<EnableArgs>;
}

export interface WMController extends GameController {
    // registerView(functions: WmViewFunctions): void;
    click(id: string): void;
    onResponse?: (id: string) => Promise<void>;
    itemLayout(): ItemLayoutFunctions;
}

export interface ItemLayoutFunctions {
    location(pt: { x: number, y: number}, time: number): {x: number, y: number };
    size(pt: { x: number, y: number}, time: number): number;
}

export type HiliteArgs = { id: string, on: boolean };
export type AddItemArgs = { item: Item };
export type EnableArgs = { value: boolean };
export type ShowTextArgs = { value: string };
export type UpdateLevelArgs = { current: number, top: number };
export type UpdateProgressArgs = { target: number, fail: number, end: number };

export type Item = {
    id: string,
    x: number,
    y: number,
    text?: string,
    type: string
};

// type Nullable<T> = { [K in keyof T]: T[K] | null };

export class WMGridController implements WMController {
    protected proxyApi: CommandApi;
    constructor(protected api: ApiWrapper) {
        this.proxyApi = new CommandApiProxyWM(api);
    }

    protected size: {x: number, y: number, z: number} = { x: 4, y: 4, z: 1 };
    protected meta: Meta = new Meta();
    private onFinished?: (() => void) | null;

    private _signalLevel = new SignalX1<UpdateLevelArgs>();
    public get levelUpdateSignal() { return this._signalLevel.consumer; }

    private _signalProgress = new SignalX1<UpdateProgressArgs>();
    public get progressUpdateSignal() { return this._signalProgress.consumer; }

    private _signalShowText = new SignalX1<ShowTextArgs>();
    public get showTextSignal() { return this._signalShowText.consumer; }

    private _signalHilite = new SignalX1<HiliteArgs>();
    public get hiliteSignal() { return this._signalHilite.consumer; }

    private _signalAddItem = new SignalX1<AddItemArgs>();
    public get addItemSignal() { return this._signalAddItem.consumer; }

    private _signalEnable = new SignalX1<EnableArgs>();
    public get enableSignal() { return this._signalEnable.consumer; }


    async init(onFinished?: (() => void) | null) {
        this.onFinished = onFinished;

        const enterPhaseResultEx = await this.api.enterPhase();
        if (enterPhaseResultEx) {
            const size = enterPhaseResultEx.enterPhaseResult.phaseDefinition.settings.size;
            if (size) this.size = size;

            if (enterPhaseResultEx.meta)
                this.meta = enterPhaseResultEx.meta;
        }

        for (let item of this.createItems()) {
            this._signalAddItem.dispatch({item: item});
            // this.listeners.forEach(o => o.add(item));
        }

        this.updateLevelAndProgress(this.meta);
    }

    private updateLevelAndProgress(meta: Meta) {
        this._signalLevel.dispatch({ current: meta.level.current, top: meta.level.top});
        this._signalProgress.dispatch({
            target: meta.progress.targetPercentage,
            fail: meta.progress.failPercentage,
            end: meta.progress.endPercentage,
        });
    }

    async start() {
        const stim = await this.proxyApi.getStimulus();
        if (!stim) {
            if (this.onFinished)
                this.onFinished();
            return false;
        }
        await this.executeSequence(stim.commands);
        return true;
    }

    protected createItems() {
        return Array.from(Array(this.size.x))
            .map((_, x) => Array.from(Array(this.size.y))
                .map((_, y) => (<Item>{ x, y, id: `${x + y * this.size.x}`, text: "", type: "circle" })))
        .flat();
    }

    itemLayout(): ItemLayoutFunctions {
        const fact = 100;
        return {
            location: (pt: { x: number, y: number}, time: number = 0) => {
                return {
                    x: fact * (0.5 + pt.x) / (this.size.x + 1),
                    y: fact * (0.5 + pt.y) / (this.size.x + 1),
                }
            },
            size: (pt: { x: number, y: number}, time: number = 0) => {
                return 0.5 * fact / (this.size.x + 2);
            }
        }
    }

    async executeSequence(cmds: Cmd[]) {
        for (let cmd of cmds) {
            await this.execute(cmd);
        }
    }

    private execute(cmd: Cmd) {
        return new Promise<void>((res, rej) => {
            switch (cmd.type) {
                case "text":
                    const t = cmd as Text;
                    this._signalShowText.dispatch({ value: t.value });
                    break;
                case "enable":
                    const e = cmd as Enable;
                    this._signalEnable.dispatch({ value: e.value });
                    break;
                case "hilite":
                    const h = cmd as Hilite;
                    this._signalHilite.dispatch({id: h.id.toString(), on: h.on});
                    // listeners.forEach(o => o.hilite(h.id.toString(), h.on));
                    break;
                case "sleep":
                    const s = cmd as Sleep;
                    setTimeout(res, s.timeMs);
                    return;
                default:
            };
            res();
        })
    }

    click(id: string) {
        this._signalEnable.dispatch({ value: false})
        for (let item of this.createItems())
            this._signalHilite.dispatch({ id: item.id.toString(), on: false})

        this.proxyApi.postResponse(id).then(result => {
            if (result.result.analysis?.isFinished) {
                this.meta = result.result.meta;
                this.updateLevelAndProgress(this.meta);
            }
            this.executeSequence(result.commands || []).then(() => {
                if (result.result.analysis?.isFinished) {
                    this.start();
                } else {
                    this._signalEnable.dispatch({ value: true})
                }
            });
        });
    }
    
    onResponse?: ((id: string) => Promise<void>) | undefined;
}

export class WMCircleController extends WMGridController {
    itemLayout(): ItemLayoutFunctions {
        const fact = 100;
        return {
            location: (pt: { x: number, y: number}, time: number = 0) => {
                let margin = 20;
                let fact2 = fact - margin;
                
                const rpm = 1.0;
                const rotationSpeedFract = 1.0 / rpm * 60000;
                const v = (pt.x / (this.size.x + 0)) * Math.PI * 2 + 2 * Math.PI * ((time % rotationSpeedFract) / rotationSpeedFract);
                const f = (value: number, sf: (val: number) => number) => (sf(value) + 1) / 2 * fact2 + margin/2;
                
                return { x: f(v, Math.sin), y: f(v, Math.cos) };
            },
            size: (pt: { x: number, y: number}, time: number = 0) => {
                return Math.PI / 4 * fact / (this.size.x + 2);
            }
        }
    }
}

export class WMNumbersController extends WMGridController {
    protected createItems() {
        const items = super.createItems();
        for (let item of items) {
            item.text = `${parseFloat(item.id) + 1}`;
            item.type = "number"
        }
        return items;
    }
}

export class WMMovingController extends WMGridController {
}
