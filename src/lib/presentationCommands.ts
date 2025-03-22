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
