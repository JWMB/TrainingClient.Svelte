<script lang="ts">
	import { type WMController } from "$lib/controllers/wmController";
	import { max } from "$lib/utils";

    let { controller }: {
        controller: WMController | null,
    } = $props();

    function wmController() { return controller as WMController; }
    
    // very backwards - better if controller can take a view as argument
    // but how can we type the view? how to use/implement and interface in a svelte component..?
    wmController()?.registerView({
        hilite: (id, on) => getItem(id).hilite = on,
        add: (id, x, y) => items.push({
            id: id, x, y,
            hilite: false
            }),
        enable: value => enabled = value,
        showText: value => textMessage = value
    });

    let textMessage: string = $state("");
    let enabled: boolean = $state(true);

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
        // if (!enabled) return;
        getItem(id).hilite = hilite;
    }
    function onClick(item: {id: number}) {
        wmController().click(item.id);
    }
    const getCX = (v: number) => 100 * (0.5 + v) / (gridSize.x + 1);
    const getCY = (v: number) => 100 * (0.5 + v) / (gridSize.y + 1);
</script>

<div>
    <svg viewBox="0 0 100 100" height="300px" style="filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))">
        {#each items as item}
            <circle 
                onmouseenter={e => userHilite(item.id, true)} onmouseleave={e => userHilite(item.id, false)}
                onclick={e => onClick(item)}
                cx="{getCX(item.x)}%" cy="{getCY(item.y)}%" r="{0.5 * 100 / (gridSize.x + 2)}%"
                fill={item.hilite ? (enabled ? "red" : "cyan") : "blue"} stroke="black" stroke-width="1"
            />
        {/each}
        <rect fill="rgba(0,100,100,0.0)" width="100%" height="100%" visibility={enabled ? "hidden" : ""}></rect>
    </svg>
</div>

<h2>{textMessage}</h2>
