import type { CommandApi } from "$lib/commandApis/commandApi";
import type { Cmd, Hilite, Sleep, Enable, Text } from "$lib/presentationCommands";

export interface GameController {
    init(onFinished: () => void): Promise<void>;
    start(): Promise<boolean>;
    // present(stimuli: IStimuli): Promise<void>;   
}

export interface WMController extends GameController {
    registerView(functions: WmViewFunctions): void;
    click(id: number): void;
    onResponse?: (id: number) => Promise<void>;
}
export interface WmViewFunctions {
    hilite(id: number, on: boolean): void;
    add(id: number, x: number, y: number): void;
    enable(value: boolean): void;
    showText(value: string): void;
    updateLevel(current: number, top: number): void;
    updateProgress(target: number, fail: number, end: number): void;
}

export class WMGridController implements WMController {
    constructor(private size: {x: number, y: number}, private api: CommandApi) {
    }

    createItems() {
        return Array.from(Array(this.size.x))
            .map((_, x) => Array.from(Array(this.size.y))
                .map((_, y) => ({ x, y, id: x + y * this.size.x })))
        .flat();
    }

    private onFinished: (() => void) | null = null;
    async init(onFinished: () => void) {
        this.onFinished = onFinished;
        // console.log("INIT");
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