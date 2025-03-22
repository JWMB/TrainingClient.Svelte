<script lang="ts">
	import { onMount } from "svelte";
	import { WMGridController, type Cmd, type GameController, type Hilite, type Sleep, type WMController } from "./wm";

    // https://github.com/sveltejs/svelte/discussions/10690
    // TODO: incoming
    let { controller }: {
        controller: WMController,
    } = $props();

    function wmController() { return controller as WMController; }
    // let { a }: { a: number } = $props;
    
    wmController().register({
        hilite: (id: number, on: boolean) => getItem(id).hilite = on,
        add: (id: number, x: number, y: number) => items.push({
            id: id, hilite: false,
            px: 100 * (0.5 + x) / 4,
            py: 100 * (0.5 + y) / 4 })
    });

    let highlighted: number | null = null;
    let enabled: boolean = true;
    // const wm: WM = new WMGrid({x: 4, y: 4}, [1,5,7,6]);
    // export const highlighted: number | null = $state(null);
    // export const enabled: boolean = $state(false);

    export class Amam {
    }
    const gridSize = {x: 4, y: 4};

    const diameter = 50;
    const padding = 10;
    const items: {id: number, hilite: boolean, px: number, py: number}[] = $state([]);
    // const items = $state(
    //     wmController().createItems().map(o => ({ 
    //         left: o.x * (diameter + padding),
    //         top: o.y * (diameter + padding),
    //         px: 100 * (0.5 + o.x) / gridSize.x,
    //         py: 100 * (0.5 + o.y) / gridSize.y,
    //         hilite: o.id == highlighted,
    //          ...o}))
    //     );
    
    // const sequence = wmController().getSequence();
    // function execute(cmd: Cmd) {
    //     return new Promise<void>((res, rej) => {
    //         // console.log("asd", cmd);
    //         switch (cmd.type) {
    //             case "hilite":
    //                 const h = cmd as Hilite;
    //                 getItem(h.id).hilite = h.on;
    //                 break;
    //             case "sleep":
    //                 const s = cmd as Sleep;
    //                 setTimeout(res, s.timeMs);
    //                 return;
    //             default:
    //         };
    //         res();
    //     })
    // }

    onMount(async () => {
        // for (let cmd of sequence) { await execute(cmd); }
    });

    function getItem(id: number) {
        const item = items.find(o => o.id == id);
        if (!item) throw new Error("Incorrect id");
        return item;
    }
    function userHilite(id: number, hilite: boolean) {
        if (!enabled) return;
        getItem(id).hilite = hilite;
    }
    function onClick(item: {id: number}) {
        console.log("clicked", item.id);
    }
</script>

<h1>WM GRID</h1>

<div>
    <svg viewBox="0 0 100 100" height="300px">
        {#each items as item}
            <circle 
                onmouseenter={e => userHilite(item.id, true)} onmouseleave={e => userHilite(item.id, false)}
                onclick={e => onClick(item)}
                cx="{item.px}%" cy="{item.py}%" r="{0.5 * 100 / (gridSize.x + 1)}%"
                fill={item.hilite ? "red" : "blue"} stroke="black" stroke-width="1"
            />
        {/each}
    </svg>
</div>
