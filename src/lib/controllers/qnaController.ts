import type { GameController } from "./wmController";

export class QnAController implements GameController {
    init(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    start(): Promise<boolean> {
        throw new Error("Method not implemented.");
    }

}