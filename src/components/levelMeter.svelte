<script lang="ts">

    let { 
        current = 4,
        top = 5,
        last = 3
    }: {
        current: number,
        last?: number | null,
        top: number
    } = $props();

</script>

<div>
    Level:{current} (max:{top})
</div>

