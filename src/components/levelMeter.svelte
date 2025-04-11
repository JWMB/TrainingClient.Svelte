<script lang="ts">
	import ProgressBar from "./progressBar.svelte";

    let { 
        current = 4,
        top = 5,
        last = 3
    }: {
        current: number,
        last?: number | null,
        top: number
    } = $props();

    let fraction = $derived(current / (Math.max(top, current + 1)));
</script>

<div>
    Level:{current}
    <ProgressBar value={fraction} color="pink"></ProgressBar>
</div>

