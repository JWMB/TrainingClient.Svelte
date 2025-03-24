import type { CommandApi } from "$lib/commandApis/commandApi";
import type { EnterPhaseResult } from "$lib/nswagclient";
import type { Cmd, Hilite, Sleep, Enable, Text } from "$lib/presentationCommands";

export interface GameController {
    init(): Promise<void>;
    start(): Promise<boolean>;
    // present(stimuli: IStimuli): Promise<void>;   
}

export interface WMController extends GameController {
    registerView(functions: WmViewFunctions): void;
    click(id: number): void;
    onResponse?: (id: number) => Promise<void>;
    itemLayout(): ItemLayoutFunctions;
}

export interface ItemLayoutFunctions {
    location(pt: { x: number, y: number}, time: number): {x: number, y: number };
    size(pt: { x: number, y: number}, time: number): number;
}

type WmViewFunctionsNonNull = { 
    hilite: (id: number, on: boolean) => void;
    add: (id: number, x: number, y: number) => void;
    enable: (value: boolean) => void;
    showText: (value: string) => void;
    updateLevel: (current: number, top: number) => void;
    updateProgress: (target: number, fail: number, end: number) => void;
};

type Nullable<T> = { [K in keyof T]: T[K] | null };

export type WmViewFunctions = Nullable<WmViewFunctionsNonNull>;

// export interface WmViewFunctions {
//     hilite(id: number, on: boolean): void;
//     add(id: number, x: number, y: number): void;
//     enable(value: boolean): void;
//     showText(value: string): void;
//     updateLevel(current: number, top: number): void;
//     updateProgress(target: number, fail: number, end: number): void;
// }

export class WMGridController implements WMController {
    constructor(enterPhaseResult: EnterPhaseResult | undefined, protected api: CommandApi) { //protected size: {x: number, y: number}
        this.size = enterPhaseResult?.phaseDefinition.settings.size || { x: 4, y: 4, z: 1};
    }

    protected size: {x: number, y: number, z: number};

    createItems() {
        return Array.from(Array(this.size.x))
            .map((_, x) => Array.from(Array(this.size.y))
                .map((_, y) => ({ x, y, id: x + y * this.size.x })))
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

    private onFinished: (() => void) | null = null;
    async init() {
        // this.onFinished = onFinished;
        for (let item of this.createItems()) {
            this.listeners.forEach(o => o.add(item.id, item.x, item.y));
        }
    }
    async start() {
        const stim = await this.api.getStimulus();
        if (!stim) {
            if (this.onFinished)
                this.onFinished();
            return false;
        }
        await this.executeSequence(stim.commands);
        return true;
    }

    async executeSequence(cmds: Cmd[]) {
        for (let cmd of cmds) {
            await execute(cmd, this.listeners);
        }

        function execute(cmd: Cmd, listeners: WmViewFunctionsNonNull[]) {
            return new Promise<void>((res, rej) => {
                switch (cmd.type) {
                    case "text":
                        const t = cmd as Text;
                        listeners.forEach(o => o.showText(t.value));
                        break;
                    case "enable":
                        const e = cmd as Enable;
                        listeners.forEach(o => o.enable(e.value));
                        break;
                    case "hilite":
                        const h = cmd as Hilite;
                        listeners.forEach(o => o.hilite(h.id, h.on));
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
    }

    private listeners: WmViewFunctionsNonNull[] = [];
    //private functions?: WmViewFunctionsNonNull;
    registerView(functions: WmViewFunctions): void {
        this.listeners.push(<WmViewFunctionsNonNull>{
            hilite: functions.hilite != null ? functions.hilite : (id, on) => {},
            add: functions.add != null ? functions.add : (id, x, y) => {},
            enable: functions.enable != null ? functions.enable : v => {},
            showText: functions.showText != null ? functions.showText : v => {},
            updateLevel: functions.updateLevel != null ? functions.updateLevel : v => {},
            updateProgress: functions.updateProgress != null ? functions.updateProgress : v => {},
        });
    }

    click(id: number) {
        this.listeners.forEach(o => o.enable(false));
        for (let item of this.createItems())
            this.listeners.forEach(o => o.hilite(item.id, false));

        this.api.postResponse(id).then(result => {
            if (result.result.analysis?.isFinished) {
                this.listeners.forEach(o => o.updateLevel(result.result.meta.level.current, result.result.meta.level.top));
                this.listeners.forEach(o => o.updateProgress(result.result.meta.progress.targetPercentage, result.result.meta.progress.failPercentage, result.result.meta.progress.endPercentage));
            }
            this.executeSequence(result.commands || []).then(() => {
                if (result.result.analysis?.isFinished) {
                    this.start();
                } else {
                    this.listeners.forEach(o => o.enable(true));
                }
            });
        });
    }
    
    onResponse?: ((id: number) => Promise<void>) | undefined;
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
}

export class WMMovingController extends WMGridController {
}
