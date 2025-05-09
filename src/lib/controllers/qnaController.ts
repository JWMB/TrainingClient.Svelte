import type { ApiWrapper } from "$lib/apiWrapper";
import { SignalX0, SignalX1, SignalX1Public, type SignalX0Public } from "$lib/signals";
import { GameSignalsBase, type GameController, type GameSignalsPublic, type Item } from "./gameController";

export type AddItemsXArgs<T> = { items: T[] };
export type XItem = { text?: string, image?: string, sound?: string, type: "question" | "alternative" | "input" };
export interface GameSignalsPublicQnA extends GameSignalsPublic {
    get clear(): SignalX0Public;
    get init(): SignalX0Public;
    get addItemsX(): SignalX1Public<AddItemsXArgs<XItem>>;
}

export class GameSignalsQnA extends GameSignalsBase implements GameSignalsPublicQnA {
    _clear = new SignalX0();
    get clear() { return this._clear.consumer; };

    _init = new SignalX0();
    get init() { return this._init.consumer; };

    _addItemsX = new SignalX1<AddItemsXArgs<XItem>>();
    public get addItemsX() { return this._addItemsX.consumer; }
}

export type QnAAlternative = {
    text?: string;
    image?: string;
    sound?: string;
}

export class QnAController implements GameController {
    private _signals = new GameSignalsQnA();
    get signals(): GameSignalsPublicQnA { return this._signals; }

    constructor(protected api: ApiWrapper) { }

    private _previousDataUrls: string[] = []; 
    get previousDataUrls() { return this._previousDataUrls; }

    async init() {
        const configurables = await this.api.getConfigurables();
        if (typeof configurables === "object") {
            const c = <any>configurables;
            const urls = c.properties?.Source?.enum as string[];
            if (urls?.length > 0) {
                this._previousDataUrls = urls.filter(o => o.length && o != "*");
                // console.log("this._previousDataUrls", this._previousDataUrls);
            } else {
                console.warn("no urls in configurables", configurables);
            }
        }
        await this.reload();
    }

    async reload(dataUrl?: string ) {
        let config: object | undefined = undefined; 
        if (dataUrl) {
            config = { source: dataUrl };
        }
        const enterPhaseResultEx = await this.api.enterPhase(config);
        if (enterPhaseResultEx) {
        }
        this._signals._init.dispatch();
    }

    async start() {
        this._signals._clear.dispatch();

        // console.log("get next", Date.now());
        const stimSol = await this.api.nextStimuliAndSolution();
        // console.log("stims", stimSol);
        if (!stimSol) {
            throw new Error("No stimulus");
        }

        let items: XItem[] = [
            {
                // id: "", x: 0, y: 0,
                text: (stimSol.stimuli.question as QnAAlternative).text,
                image: (stimSol.stimuli.question as QnAAlternative).image,
                sound: (stimSol.stimuli.question as QnAAlternative).sound,
                type: "question"
            }
        ];
        if (stimSol.stimuli.alternatives.length) {
            // console.log("qq", (stimSol.stimuli.alternatives as any[]).map(o => o as QnAAlternative).map(o => `${o?.image}`));
            items = items.concat(
                (stimSol.stimuli.alternatives as QnAAlternative[]).map(o => ({
                    text: o.text, image: o.image, sound: o.sound, type: "alternative"
                })) //id: "", x: 1, y: 0, 
            );
        } else {
            items = items.concat({text: "", type: "input"}); // id: "", x: 1, y: 0, 
        }

        this._signals._addItemsX.dispatch({ items: items });
        
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
