import type { ApiWrapper } from "$lib/apiWrapper";
import { GameSignalsBase, type GameController, type GameSignalsPublic } from "./gameController";

export class QnAController implements GameController {
    private _signals = new GameSignalsBase();
    get signals(): GameSignalsPublic { return this._signals; }

    constructor(protected api: ApiWrapper) {
    }
    async init() {
        const enterPhaseResultEx = await this.api.enterPhase();
        if (enterPhaseResultEx) {
        }
    }
    async start() {
        const stimSol = await this.api.nextStimuliAndSolution();
        // console.log("stims", stimSol);
        if (stimSol) {
            this._signals._addItem.dispatch({
                item: {
                    id: "", x: 0, y: 0,
                    text: stimSol.stimuli.problemString,
                    type: "question"
                }
            });
            if (stimSol.solution?.values) {
                if (stimSol.solution.values.length === 1) {
                    this._signals._addItem.dispatch({
                        item: { id: "", x: 1, y: 0, text: "", type: "input" }
                    });
                } else {
                    stimSol.solution.values.forEach(v => {
                        this._signals._addItem.dispatch({
                            item: { id: "", x: 1, y: 0, text: v, type: "alternative" }
                        });
                    });
                }
            }
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
                this.start();
            }
        });
    }
}
