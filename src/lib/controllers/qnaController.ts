import type { SignalX1Public } from "$lib/signals";
import type { AddItemArgs, EnableArgs, GameController, HiliteArgs, ShowTextArgs, UpdateLevelArgs, UpdateProgressArgs } from "./wmController";

export class QnAController implements GameController {
    get enableSignal(): SignalX1Public<EnableArgs> { throw new Error("Method not implemented."); }
    get addItemSignal(): SignalX1Public<AddItemArgs> { throw new Error("Method not implemented."); }
    get hiliteSignal(): SignalX1Public<HiliteArgs> { throw new Error("Method not implemented."); }
    get showTextSignal(): SignalX1Public<ShowTextArgs> { throw new Error("Method not implemented."); }
    get progressUpdateSignal(): SignalX1Public<UpdateProgressArgs> { throw new Error("Method not implemented."); }
    get levelUpdateSignal(): SignalX1Public<UpdateLevelArgs> { throw new Error("Method not implemented."); }

    init(): Promise<void> { throw new Error("Method not implemented."); }
    start(): Promise<boolean> { throw new Error("Method not implemented."); }
}