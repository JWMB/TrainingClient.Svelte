const reduceWith = (vals: number[], func: (p: number, c: number) => number) => vals.length ? vals.reduce(func) : 0;

export function max(array: number[]) {
    return reduceWith(array, (p, c) => Math.max(p, c));
}