import type { ApiWrapper } from "$lib/apiWrapper";
import { SignalX1, type SignalX1Public } from "$lib/signals";
import { GameSignalsBase, type GameController, type GameSignalsPublic } from "./gameController";

export interface GameSignalsPublicNVR extends GameSignalsPublic {
    get setDragTargets(): SignalX1Public<DragTargetsArgs>;
}

export class GameSignalsNVR extends GameSignalsBase implements GameSignalsPublicNVR {
    _setDragTargets = new SignalX1<DragTargetsArgs>();
    get setDragTargets() { return this._setDragTargets.consumer; };
}

export type DragTargetsArgs = { items: {x: number, y: number}[]};

export class NVRController implements GameController {
    private _signals = new GameSignalsNVR();
    get signals(): GameSignalsPublicNVR { return this._signals; }
    // protected _signals = new GameSignalsBase();
    // get signals(): GameSignalsPublic { return this._signals; }

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

        this._signals._setDragTargets.dispatch({ items: stimSol.stimuli.emptySlots });

        const allCards = stimSol.stimuli.questionCards.map((o: any) => ({ item: o, type: "Q"}))
            .concat(stimSol.stimuli.answerCards.map((o: any) => ({ item: o, type: "A"})));
        this._signals._addItems.dispatch({items:
            allCards.map((o: any) => ({ id: "", x: o.item.location.x, y: o.item.location.y, text: o.item.svg, type: o.type }))});

        return true;
    }
}