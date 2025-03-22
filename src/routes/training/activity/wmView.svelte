<script lang="ts">
	import { type WMController } from "$lib/controllers/wmController";

    let { controller }: {
        controller: WMController | null,
    } = $props();

    function wmController() { return controller as WMController; }
    
    wmController()?.registerView({
        hilite: (id: number, on: boolean) => getItem(id).hilite = on,
        add: (id: number, x: number, y: number) => items.push({
            id: id, x, y,
            hilite: false
            }),
        enable: (value: boolean) => enabled = value,
        showText: (value: string) => textMessage = value
    });

    const reduceWith = (vals: number[], func: (p: number, c: number) => number) => vals.length ? vals.reduce(func) : 0;
    const max = (vals: number[]) => reduceWith(vals, (p, c) => Math.max(p, c));

    let textMessage: string = $state("");
    let enabled: boolean = true;

    const items: {id: number, hilite: boolean, x: number, y: number }[] = $state([]);
    let gridSize = $derived({ 
        x: max(items.map(o => o.x)),
        y: max(items.map(o => o.y))
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
        wmController().click(item.id);
    }
    const getCX = (v: number) => 100 * (0.5 + v) / (gridSize.x + 1);
    const getCY = (v: number) => 100 * (0.5 + v) / (gridSize.y + 1);
</script>

<div>
    <svg viewBox="0 0 100 100" height="300px">
        {#each items as item}
            <circle 
                onmouseenter={e => userHilite(item.id, true)} onmouseleave={e => userHilite(item.id, false)}
                onclick={e => onClick(item)}
                cx="{getCX(item.x)}%" cy="{getCY(item.y)}%" r="{0.5 * 100 / (gridSize.x + 2)}%"
                fill={item.hilite ? "red" : "blue"} stroke="black" stroke-width="1"
            />
        {/each}
    </svg>
</div>

<h2>{textMessage}</h2>
