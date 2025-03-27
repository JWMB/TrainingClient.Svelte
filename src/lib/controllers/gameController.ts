import { SignalX1, type SignalX1Public } from "$lib/signals";

export interface GameController {
    init(): Promise<void>;
    start(): Promise<boolean>;

    get signals(): GameSignalsPublic;
}

export type HiliteArgs = { id: string, on: boolean };
export type AddItemArgs = { item: Item };
export type EnableArgs = { value: boolean };
export type ShowTextArgs = { value: string };
export type UpdateLevelArgs = { current: number, top: number };
export type UpdateProgressArgs = { target: number, fail: number, end: number };
export type CompletedArgs = { success?: boolean };

export type Item = {
    id: string,
    x: number,
    y: number,
    text?: string,
    type: string
};

// Separate public and internal signals so consumers can't access e.g. dispatch()
export interface GameSignalsPublic {
    get levelUpdate(): SignalX1Public<UpdateLevelArgs>;
    get progressUpdate(): SignalX1Public<UpdateProgressArgs>;
    get showText(): SignalX1Public<ShowTextArgs>;
    get enable(): SignalX1Public<EnableArgs>;
    get completed(): SignalX1Public<CompletedArgs>;

    get hilite(): SignalX1Public<HiliteArgs>;
    get addItem(): SignalX1Public<AddItemArgs>;
}
export interface GameSignalsInternal {
    _levelUpdate: SignalX1<UpdateLevelArgs>;
    _progressUpdate: SignalX1<UpdateProgressArgs>;
    _showText: SignalX1<ShowTextArgs>;
    _enable: SignalX1<EnableArgs>;
    _completed: SignalX1<CompletedArgs>;

    _hilite: SignalX1<HiliteArgs>;
    _addItem: SignalX1<AddItemArgs>;
}


export class GameSignalsBase implements GameSignalsPublic, GameSignalsInternal {
    _levelUpdate = new SignalX1<UpdateLevelArgs>();
    public get levelUpdate() { return this._levelUpdate.consumer; }

    _progressUpdate = new SignalX1<UpdateProgressArgs>();
    public get progressUpdate() { return this._progressUpdate.consumer; }

    _showText = new SignalX1<ShowTextArgs>();
    public get showText() { return this._showText.consumer; }

    _hilite = new SignalX1<HiliteArgs>();
    public get hilite() { return this._hilite.consumer; }

    _addItem = new SignalX1<AddItemArgs>();
    public get addItem() { return this._addItem.consumer; }

    _enable = new SignalX1<EnableArgs>();
    public get enable() { return this._enable.consumer; }

    _completed = new SignalX1<CompletedArgs>();
    public get completed() { return this._completed.consumer; }
}