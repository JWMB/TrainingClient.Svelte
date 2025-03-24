<script lang="ts">
    let { 
        target = 0,
        fail = 0,
        end = 0
    }: {
        target: number,
        fail: number,
        end: number
    } = $props();
</script>

Progress - target:{target} fail:{fail} end:{end}
