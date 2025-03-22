import type { IStimuli } from "$lib/nswagclient";

export interface GameController {
    init(): void;
    present(stimuli: IStimuli): Promise<void>;
}

export interface WMController extends GameController {
    createItems(): WMItem[];
    getSequence(): Cmd[];

    register(functions: WmViewFunctions): void;
}
export interface WmViewFunctions {
    hilite(id: number, on: boolean): void;
    add(id: number, x: number, y: number): void;
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
// class Hilite_ implements Hilite {
// }

export interface PresentWM {
    hilite(id: number, on: boolean): void;
}

export type WMItem = {
    x: number,
    y: number,
    id: number
}

export class WMGridController implements WMController {
    private itemSequence: number[] = [];

    constructor(private size: {x: number, y: number}) {
    }
    createItems() {
        return Array.from(Array(this.size.x))
            .map((_, x) => Array.from(Array(this.size.y))
                .map((_, y) => ({ x, y, id: x + y * this.size.x })))
        .flat();
    }
    getSequence(): Cmd[] {
        return this.itemSequence.map(o => [
            <Hilite>{ type:"hilite", id: o, on: true},
            <Sleep>{ type:"sleep", timeMs: 1000},
            <Hilite>{ type:"hilite", id: o, on: false},
            <Sleep>{ type:"sleep", timeMs: 1000},
        ]).flat();
    }

    init() {
        console.log("INIT");
        for (let item of this.createItems()) {
            this.functions?.add(item.id, item.x, item.y);
        }
    }
    async present(stimuli: IStimuli) {
        this.itemSequence = (<any>stimuli).sequence as number[];
        console.log("asd", this.itemSequence);
        for (let cmd of this.getSequence()) {
            await execute(cmd, this.functions);
        }

        function execute(cmd: Cmd, functions?: WmViewFunctions) {
            return new Promise<void>((res, rej) => {
                // console.log("asd", cmd);
                switch (cmd.type) {
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
    register(functions: WmViewFunctions): void {
        console.log("REG");
        this.functions = functions;
    }
    // onClick(id: number): void { }
}