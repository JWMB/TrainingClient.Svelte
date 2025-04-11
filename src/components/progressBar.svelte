<script lang="ts">
    let {
        value = 0,
        color = "green",
    }: {
        value: number,
        color: string,
    } = $props();

</script>

<style>
    .progress-bar {
        background-color: lightgray;
    }
</style>

<div class="progress-bar" style="flex:1">
    <div class="filled" style="height:24px;background-color:{color};width:{value*100}%"></div>
</div>
