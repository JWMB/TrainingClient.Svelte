import type { GameSignalsInternal } from "./controllers/gameController";

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

export class CommandSequenceExecuter {
    constructor(private signals: GameSignalsInternal) {
    }
    
    async executeSequence(cmds: Cmd[], ) {
        for (let cmd of cmds) {
            await this.execute(cmd);
        }
    }

    private execute(cmd: Cmd) {
        return new Promise<void>((res, rej) => {
            switch (cmd.type) {
                case "text":
                    const t = cmd as Text;
                    this.signals._showText.dispatch({ value: t.value });
                    break;
                case "enable":
                    const e = cmd as Enable;
                    this.signals._enable.dispatch({ value: e.value });
                    break;
                case "hilite":
                    const h = cmd as Hilite;
                    this.signals._hilite.dispatch({id: h.id.toString(), on: h.on});
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
