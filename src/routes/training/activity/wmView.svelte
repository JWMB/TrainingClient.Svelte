<script lang="ts">
	import { type ItemLayoutFunctions, type WMController } from "$lib/controllers/wmController";
	import { onMount } from "svelte";

    let { controller }: {
        controller: WMController | null,
    } = $props();

    function wmController() { return controller as WMController; }
    let layout: ItemLayoutFunctions | null;

    onMount(async () => {
        if (!wmController()) {
            console.warn("No ctrl");
            return;
        }

        layout = wmController().itemLayout();
        // very backwards - better if controller can take a view as argument
        // but how can we type the view? how to use/implement and interface in a svelte component..?
        wmController().registerView({
            hilite: (id, on) => getItem(id).hilite = on,
            add: (id, x, y) => items.push({
                id: id, x, y,
                hilite: false
                }),
            enable: value => enabled = value,
            showText: null, updateLevel: null, updateProgress: null
        });

        await wmController().init();
        await wmController().start();
    });

    // trying to find ways to re-render items (layout.location might return different values depending on time)
    $effect(() => {
        const interval = setInterval(() => {
            time = Date.now();
        }, 25);
        return () => { clearInterval(interval); };
    });
    let time: number = $state(0);

    let enabled: boolean = $state(true);

    const items: {id: number, hilite: boolean, x: number, y: number }[] = $state([]);

    function getItem(id: number) {
        const item = items.find(o => o.id == id);
        if (!item) throw new Error(`Incorrect id: ${id}`);
        return item;
    }
    function userHilite(id: number, hilite: boolean) {
        getItem(id).hilite = hilite;
    }
    function onClick(item: {id: number}) {
        wmController().click(item.id);
    }
</script>

<div>
    <div id={time.toString()}>
        <svg viewBox="0 0 100 100" height="300px" style="filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))">
        {#each items as item}
            <circle id={`item_${item.id}`}
                onmouseenter={e => userHilite(item.id, true)} onmouseleave={e => userHilite(item.id, false)}
                onclick={e => onClick(item)}
                cx="{layout?.location(item, time).x}%" cy="{layout?.location(item, time).y}%" r="{layout?.size(item, time)}%"
                fill={item.hilite ? (enabled ? "red" : "cyan") : "blue"} stroke="black" stroke-width="1"
            />
        {/each}
        <rect fill="rgba(0,100,100,0.0)" width="100%" height="100%" visibility={enabled ? "hidden" : ""}></rect>
    </svg>
    </div>
</div>
