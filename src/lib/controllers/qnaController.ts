import type { ApiWrapper } from "$lib/apiWrapper";
import { SignalX0, type SignalX0Public } from "$lib/signals";
import { GameSignalsBase, type GameController, type GameSignalsPublic } from "./gameController";

export interface GameSignalsPublicQnA extends GameSignalsPublic {
    get clear(): SignalX0Public;
}
export class GameSignalsQnA extends GameSignalsBase implements GameSignalsPublicQnA {
    _clear = new SignalX0();
    get clear() { return this._clear.consumer; };
}

export class QnAController implements GameController {
    private _signals = new GameSignalsQnA();
    get signals(): GameSignalsPublicQnA { return this._signals; }

    constructor(protected api: ApiWrapper) { }

    async init() {
        const enterPhaseResultEx = await this.api.enterPhase();
        if (enterPhaseResultEx) {
        }
    }
    async start() {
        const stimSol = await this.api.nextStimuliAndSolution();
        // console.log("stims", stimSol);
        if (!stimSol) {
            throw new Error("No stimulus");
        }

        this._signals._addItem.dispatch({
            item: {
                id: "", x: 0, y: 0,
                text: stimSol.stimuli.question,
                type: "question"
            }
        });
        if (stimSol.stimuli.alternatives.length) {
            (stimSol.stimuli.alternatives as string[]).forEach(v => {
                this._signals._addItem.dispatch({
                    item: { id: "", x: 1, y: 0, text: v, type: "alternative" }
                });
            });
        } else {
            this._signals._addItem.dispatch({
                item: { id: "", x: 1, y: 0, text: "", type: "input" }
            });
        }
        
        return true;
    }

    respond(value: string) {
        this.api.registerResponse(value).then(result => {
            // console.log(result);
            if (result?.meta) {
                this._signals._levelUpdate.dispatch(result.meta.level);
                this._signals._progressUpdate.dispatch({
                    target: result.meta.progress.targetPercentage,
                    fail: result.meta.progress.failPercentage,
                    end: result.meta.progress.endPercentage
                });
            }
            if (result?.analysis?.isFinished) {
                this._signals._clear.dispatch();
                this.start();
            }
        });
    }
}
