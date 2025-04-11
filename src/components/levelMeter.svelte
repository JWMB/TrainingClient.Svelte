<script lang="ts">
	import DavidProgress from "./davidProgress.svelte";

    let { 
        current = 4,
        top = 5,
        last = 3
    }: {
        current: number,
        last?: number | null,
        top: number
    } = $props();

    // let fraction = $derived(current / (Math.max(top, current + 1)));
</script>

<div>
    <DavidProgress value={current} min={0} max={Math.ceil(Math.max(top, current + 1))} suffix="" showValueAs="OnlyValue" ></DavidProgress>
</div>

