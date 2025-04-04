import type { ApiWrapper } from "$lib/apiWrapper";
import { GameSignalsBase, type GameController, type GameSignalsPublic } from "./gameController";

// export interface GameSignalsPublicNVR extends GameSignalsPublic {
//     get clear(): SignalX0Public;
// }
// export class GameSignalsQnA extends GameSignalsBase implements GameSignalsPublicNVR {
//     _clear = new SignalX0();
//     get clear() { return this._clear.consumer; };
// }

export class NVRController implements GameController {
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
        console.log("stimSol.stimuli", stimSol.stimuli);
        for (let c of stimSol.stimuli.questionCards) {
            this._signals._addItem.dispatch({item: { id: "", x: c.location.x, y: c.location.y, text: c.svg, type: "Q" }});
        }
        for (let c of stimSol.stimuli.answerCards) {
            this._signals._addItem.dispatch({item: { id: "", x: c.location.x, y: c.location.y, text: c.svg, type: "A" }});
        }

        return true;
    }

    protected _signals = new GameSignalsBase();
    get signals(): GameSignalsPublic { return this._signals; }
}