import { onMount } from "svelte";

const reduceWith = (vals: number[], func: (p: number, c: number) => number) => vals.length ? vals.reduce(func) : 0;

export function max(array: number[]) {
    return reduceWith(array, (p, c) => Math.max(p, c));
}

export function setBackground(background: string) {
    // onMount(() => {
        let current = document.body.style["backgroundImage"];
        document.body.style["backgroundImage"] = background;
    //     return () =>  document.body.style["backgroundImage"] = current;
    // })
}