<script lang="ts">
    let { hilite, x, y, size, onclick, id, text }: {
        hilite?: boolean,
        x?: number, y?: number,
        size: number,
        onclick: (id: string) => void,
        id: string,
        text?: string
    } = $props();

    let hover = $state(false);
</script>

<circle cx="{x}%" cy="{y}%" r="{size}%"
    onmouseenter={() => hover = true}
    onmouseleave={() => hover = false}
    onclick={() => onclick(id)}
    fill={hover ? "red" : (hilite ? "cyan" : "blue")} stroke="black" stroke-width="1"
></circle>
