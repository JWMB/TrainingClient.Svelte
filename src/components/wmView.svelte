<script lang="ts">
	import { type ItemLayoutFunctions, type WMController } from "$lib/controllers/wmController";
	import { onDestroy, onMount, type Component } from "svelte";
	import SvgCircleButton from "./svgCircleButton.svelte";
	import SvgNumberButton from "./svgNumberButton.svelte";

    let { controller }: {
        controller: WMController | null,
    } = $props();

    function typedController() { return controller as WMController; }
    let layout: ItemLayoutFunctions | null;

    onMount(async () => {
        if (!typedController()) {
            console.warn("No ctrl");
            return;
        }

        layout = typedController().itemLayout();

        typedController().signals.addItems.add(arg => items = arg.items.map(o => ({hilite: false, ...o })));
        typedController().signals.enable.add(arg => enabled = arg.value);
        typedController().signals.hilite.add(arg => getItem(arg.id).hilite = arg.on);
    });

    type WmItem = {
        id: string, hilite: boolean, x: number, y: number, type: string, text?: string 
    };
    let items: WmItem[] = $state([]);
    let time: number = $state(0);

    let ramHandle:number = 0;

    const update = (timestamp: number) => {
        time = timestamp;
        ramHandle = requestAnimationFrame(update);
    };
    ramHandle = requestAnimationFrame(update);

    onDestroy(() => {
        if (ramHandle) cancelAnimationFrame(ramHandle);
    });
    // for updating/animating items
    // $effect(() => {
    //     const interval = setInterval(() => { time = Date.now(); }, 25);
    //     return () => { clearInterval(interval); };
    // });

    let enabled: boolean = $state(true);

    type ComponentAndProps = {
  		component: Component<any>;
		[key: string]: any; // for props
	};

    const mapItem = (item: WmItem) => {
        return {
            component: item.type == "number" ? SvgNumberButton : SvgCircleButton,
            x: layout?.location(item, time).x,
            y: layout?.location(item, time).y,
            size: layout?.size(item, time) || 5,
            id: item.id.toString(),
            text: item.text,
            // not possible, state change... onclick: onClick(item),
            hilite: item.hilite
        } as ComponentAndProps;
    };

    const components = $derived(items.map(mapItem));

    function getItem(id: string) {
        const item = items.find(o => o.id == id);
        if (!item) throw new Error(`Incorrect id: ${id}`);
        return item;
    }
    function onClick(id: string) {
        typedController().click(id);
    }
</script>

<div>
    <div>{components.length}</div>
    <div>
        <svg viewBox="0 0 100 100" height="300px" style="filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))">
        {#each components as c}
            <c.component {...c} onclick={() => onClick((c as any).id)}/>
        {/each}
        <rect fill="rgba(0,100,100,0.0)" width="100%" height="100%" visibility={enabled ? "hidden" : ""}></rect>
    </svg>
    </div>
</div>
