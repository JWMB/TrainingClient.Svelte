<script lang="ts">
	import ProgressBar from "./progressBar.svelte";

    let { 
        target = 0,
        fail = 0,
        end = 0
    }: {
        target: number,
        fail: number,
        end: number
    } = $props();

    const colors = ["blue", "red", "green" ];
    let bars = $derived([target, fail, end].map((o, i) => (o > 0 || i == 0) ? { value: o, color: colors[i] } : null).filter(o => !!o))

</script>

<style>
    .progress-bar {
        background-color: lightgray;
    }
</style>

<div style="display: flex;">
    {#each bars as bar}
    <ProgressBar value={bar.value} color={bar.color}></ProgressBar>
    <!-- <div class="progress-bar" style="flex:1">
        <div class="filled" style="height:24px;background-color:{bar.color};width:{bar.value*100}%"></div>
    </div> -->
    {/each}
</div>
