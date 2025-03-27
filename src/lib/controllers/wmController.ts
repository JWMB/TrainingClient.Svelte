import type { ApiWrapper } from "$lib/apiWrapper";
import type { CommandApi } from "$lib/commandApis/commandApi";
import { CommandApiProxyWM } from "$lib/commandApis/commandApiProxyWM";
import { Meta } from "$lib/nswagclient";
import { CommandSequenceExecuter, type Cmd } from "$lib/presentationCommands";
import { GameSignalsBase, type GameController, type GameSignalsPublic, type Item } from "./gameController";

export interface WMController extends GameController {
    click(id: string): void;
    itemLayout(): ItemLayoutFunctions;
}

export interface ItemLayoutFunctions {
    location(pt: { x: number, y: number}, time: number): {x: number, y: number };
    size(pt: { x: number, y: number}, time: number): number;
}

export class WMGridController implements WMController {
    protected proxyApi: CommandApi;
    constructor(protected api: ApiWrapper) {
        this.proxyApi = new CommandApiProxyWM(api);
    }
    protected _signals = new GameSignalsBase();
    get signals(): GameSignalsPublic { return this._signals; }

    protected size: {x: number, y: number, z: number} = { x: 4, y: 4, z: 1 };
    protected meta: Meta = new Meta();


    async init() {
        // console.log("init");
        const enterPhaseResultEx = await this.api.enterPhase();
        if (enterPhaseResultEx) {
            const size = enterPhaseResultEx.enterPhaseResult.phaseDefinition.settings.size;
            if (size) this.size = size;

            if (enterPhaseResultEx.meta)
                this.meta = enterPhaseResultEx.meta;
        }

        for (let item of this.createItems()) {
            this._signals._addItem.dispatch({item: item});
        }

        this.updateLevelAndProgress(this.meta);
    }

    private updateLevelAndProgress(meta: Meta) {
        this._signals._levelUpdate.dispatch({ current: meta.level.current, top: meta.level.top});
        this._signals._progressUpdate.dispatch({
            target: meta.progress.targetPercentage,
            fail: meta.progress.failPercentage,
            end: meta.progress.endPercentage,
        });
    }

    async start() {
        const stim = await this.proxyApi.getStimulus();
        if (!stim) {
            this._signals._completed.dispatch({ });
            return false;
        }
        await this.executeCommandSequence(stim.commands);
        return true;
    }

    protected async executeCommandSequence(cmds: Cmd[]) {
        const executer = new CommandSequenceExecuter(this._signals);
        await executer.executeSequence(cmds);
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

    click(id: string) {
        this._signals._enable.dispatch({ value: false})
        for (let item of this.createItems())
            this._signals._hilite.dispatch({ id: item.id.toString(), on: false})

        this.proxyApi.postResponse(id).then(result => {
            if (result.result.analysis?.isFinished) {
                this.meta = result.result.meta;
                this.updateLevelAndProgress(this.meta);
            }
            this.executeCommandSequence(result.commands || []).then(() => {
                if (result.result.analysis?.isFinished) {
                    this.start();
                } else {
                    this._signals._enable.dispatch({ value: true})
                }
            });
        });
    }
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
