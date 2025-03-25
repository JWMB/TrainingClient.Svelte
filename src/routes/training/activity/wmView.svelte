<script lang="ts">
	import { type ItemLayoutFunctions, type WMController } from "$lib/controllers/wmController";
	import { onMount, type Component } from "svelte";
	import SvgCircleButton from "../../../components/svgCircleButton.svelte";

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

    // for updating/animating items
    $effect(() => {
        const interval = setInterval(() => { time = Date.now(); }, 25);
        return () => { clearInterval(interval); };
    });
    let time: number = $state(0);

    let enabled: boolean = $state(true);

    const items: {id: string, hilite: boolean, x: number, y: number }[] = $state([]);

    type ComponentAndProps = {
  		component: Component<any>;
		[key: string]: any; // for props
	};
	// const components: ComponentAndProps[] = $state([]);

    console.log("ASA");
    const components = $derived(items.map(item => ({
        component: SvgCircleButton,
        x: layout?.location(item, time).x,
        y: layout?.location(item, time).y,
        size: layout?.size(item, time) || 5,
        id: item.id.toString(),
        // onclick: onClick(item),
        hilite: item.hilite
     } as ComponentAndProps)));

    function getItem(id: string) {
        const item = items.find(o => o.id == id);
        if (!item) throw new Error(`Incorrect id: ${id}`);
        return item;
    }
    function onClick(id: string) {
        wmController().click(id);
    }
</script>

<div>
    <div>{components.length}</div>
    <div id={time.toString()}>
        <svg viewBox="0 0 100 100" height="300px" style="filter: drop-shadow( 3px 3px 2px rgba(0, 0, 0, .7))">
        <!-- {#each items as item}
            <SvgCircleButton id={item.id.toString()} x={layout?.location(item, time).x} y={layout?.location(item, time).y} size={layout?.size(item, time) || 5}
                hilite={item.hilite}
                onclick={() => onClick(item)}>
            </SvgCircleButton>
        {/each} -->
        {#each components as c}
            <c.component {...c} onclick={() => onClick((c as any).id)}/>
        {/each}
        <rect fill="rgba(0,100,100,0.0)" width="100%" height="100%" visibility={enabled ? "hidden" : ""}></rect>
    </svg>
    </div>
</div>
