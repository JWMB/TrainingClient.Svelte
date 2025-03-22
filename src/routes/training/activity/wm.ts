import type { ApiWrapper } from "$lib/apiWrapper";
import type { IStimuli } from "$lib/nswagclient";

export interface GameController {
    init(onFinished: () => void): Promise<void>;
    start(): Promise<boolean>;
    present(stimuli: IStimuli): Promise<void>;   
}

export interface WMController extends GameController {
    // createItems(): WMItem[];
    // getSequence(): Cmd[];
    registerView(functions: WmViewFunctions): void;
    click(id: number): void;
    onResponse?: (id: number) => Promise<void>;
}
export interface WmViewFunctions {
    hilite(id: number, on: boolean): void;
    add(id: number, x: number, y: number): void;
    enable(value: boolean): void;
    showText(value: string): void;
}

export interface Cmd {
    type: string;
}
export interface Sleep extends Cmd {
    timeMs: number;
}
export interface Hilite extends Cmd {
    id: number;
    on: boolean;
}
export interface Enable extends Cmd {
    value: boolean;
}
export interface Text extends Cmd {
    value: string;
}

export interface PresentWM {
    hilite(id: number, on: boolean): void;
}

export class WMGridController implements WMController {
    private itemSequence: number[] = [];

    constructor(private size: {x: number, y: number}, private api: ApiWrapper) {
    }

    createItems() {
        return Array.from(Array(this.size.x))
            .map((_, x) => Array.from(Array(this.size.y))
                .map((_, y) => ({ x, y, id: x + y * this.size.x })))
        .flat();
    }

    getResetSequence(): Cmd[] {
        return this.createItems().map(o => <Hilite>{ type:"hilite", id: o.id, on:false});
    }
    getBlinkSequence(id: number): Cmd[] {
        return Array.from(Array(4)).map(_ => [
            <Hilite>{ type:"hilite", id: id, on: true},
            <Sleep>{ type:"sleep", timeMs: 100},
            <Hilite>{ type:"hilite", id: id, on: false},
            <Sleep>{ type:"sleep", timeMs: 100},
        ]).flat().concat([
            <Sleep>{ type:"sleep", timeMs: 1000}
        ]);
    }
    getSequence(): Cmd[] {
        const forItems = this.itemSequence.map(o => [
            <Hilite>{ type:"hilite", id: o, on: true},
            <Sleep>{ type:"sleep", timeMs: 1000},
            <Hilite>{ type:"hilite", id: o, on: false},
            <Sleep>{ type:"sleep", timeMs: 1000},
        ]).flat();

        return (<Cmd[]>[
            <Enable>{ type: "enable", value: false },
        ])
        .concat(forItems)
        .concat([
            <Text>{ type: "text", value: "Your turn" },
            <Sleep>{ type:"sleep", timeMs: 1000},
            <Text>{ type: "text", value: "" },
            <Enable>{ type: "enable", value: true },
        ]);
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
        const stim = await this.api.nextStimuli();
        if (!stim) {
            if (this.onFinished)
                this.onFinished();
            return false;
        }
        await this.present(stim);
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
    async present(stimuli: IStimuli) {
        this.itemSequence = (<any>stimuli).sequence as number[]; // TODO: typing
        // this.userResponse = [];
        // console.log("asd", this.itemSequence);
        await this.executeSequence(this.getSequence());
    }

    private functions?: WmViewFunctions;
    registerView(functions: WmViewFunctions): void {
        this.functions = functions;
    }
    // private userResponse: number[] = [];
    click(id: number) {
        // this.userResponse.push(id);
        
        this.functions?.enable(false);
        this.executeSequence(this.getResetSequence()).then(() => {
            this.api.registerResponse(id).then(analysis => {
                if (!analysis) throw new Error("No analysis received");
                // console.log("analysis", analysis);

                if (analysis.isFinished) {
                    if (!analysis.isCorrect) {
                        // TODO: server response should contain expected item? 
                        this.executeSequence(this.getBlinkSequence(1)).then(() => {
                            this.start();
                        });
                    } else {
                        this.start();
                    }
                } else {
                    this.functions?.enable(true);
                }
            });
        });

        // if (this.onResponse)
        //     this.onResponse(id);
    }
    
    onResponse?: ((id: number) => Promise<void>) | undefined;
}