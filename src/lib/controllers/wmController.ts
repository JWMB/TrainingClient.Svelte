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

// export type ViewFunctions = { 
//     hilite: (id: number, on: boolean) => void;
//     add: (id: number, x: number, y: number) => void;
//     enable: (value: boolean) => void;
//     showText: (value: string) => void;
//     updateLevel: (current: number, top: number) => void;
//     updateProgress: (target: number, fail: number, end: number) => void;
// };

export interface WmViewFunctions {
    hilite(id: number, on: boolean): void;
    add(id: number, x: number, y: number): void;
    enable(value: boolean): void;
    showText(value: string): void;
    updateLevel(current: number, top: number): void;
    updateProgress(target: number, fail: number, end: number): void;
    tick(): void;
}

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
        console.log("INIT", this.functions);
        for (let item of this.createItems()) {
            this.functions?.add(item.id, item.x, item.y);
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
            await execute(cmd, this.functions);
        }

        function execute(cmd: Cmd, functions?: WmViewFunctions) {
            return new Promise<void>((res, rej) => {
                switch (cmd.type) {
                    case "text":
                        const t = cmd as Text;
                        if (functions) functions.showText(t.value);
                        break;
                    case "enable":
                        const e = cmd as Enable;
                        if (functions) functions.enable(e.value);
                        break;
                    case "hilite":
                        const h = cmd as Hilite;
                        if (functions) functions.hilite(h.id, h.on);
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

    private functions?: WmViewFunctions;
    registerView(functions: WmViewFunctions): void {
        this.functions = functions;
    }

    click(id: number) {
        this.functions?.enable(false);
        for (let item of this.createItems())
            this.functions?.hilite(item.id, false);

        this.api.postResponse(id).then(result => {
            if (result.result.analysis?.isFinished) {
                this.functions?.updateLevel(result.result.meta.level.current, result.result.meta.level.top);
                this.functions?.updateProgress(result.result.meta.progress.targetPercentage, result.result.meta.progress.failPercentage, result.result.meta.progress.endPercentage);
            }
            this.executeSequence(result.commands || []).then(() => {
                if (result.result.analysis?.isFinished) {
                    this.start();
                } else {
                    this.functions?.enable(true);
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

//WM_moving
export class WMNumbersController extends WMGridController {
    itemLayout(): ItemLayoutFunctions {
        let fact = 100;
        return {
            location: (pt: { x: number, y: number}, time: number = 0) => {
                let margin = 20;
                fact -= margin;
                const v = (pt.x / (this.size.x + 1)) * Math.PI * 2;
                return {
                    x: (Math.sin(v) + 1) / 2 * fact + margin/2,
                    y: (Math.cos(v) + 1) / 2 * fact + margin/2
                }
            },
            size: (pt: { x: number, y: number}, time: number = 0) => {
                return Math.PI / 4 * fact / (this.size.x + 2);
            }
        }
    }
}

// WM_moving