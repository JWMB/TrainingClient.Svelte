<script lang="ts">
    let { hilite, x, y, size, onclick, id }: {
        hilite?: boolean,
        x?: number, y?: number,
        size: number,
        onclick: (id: string) => void,
        id: string
    } = $props();

    let hover = $state(false);
</script>

<g transform="translate({x},{y})" >
    <rect width="{size*2}%" height="{size*2}%" rx="{size/5}%"
        onmouseenter={() => hover = true}
        onmouseleave={() => hover = false}
        onclick={() => onclick(id)}
        fill={hover ? "red" : (hilite ? "cyan" : "blue")} stroke="black" stroke-width="1"
        />
    <text fill="white" stroke="black" font-family="Arial, Helvetica, sans-serif" font-size="0.7em" stroke-width={0.2} x={size*0.7} y={size*1.3}>{id}</text>
</g>
