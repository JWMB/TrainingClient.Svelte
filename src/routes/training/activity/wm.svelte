<script lang="ts">

    // TODO: incoming
    let highlighted: number | null = null;
    let enabled: boolean = true;
    // export const highlighted: number | null = $state(null);
    // export const enabled: boolean = $state(false);

    const gridSize = {x: 4, y: 4};

    const diameter = 50;
    const padding = 10;
    const items = $state(
        Array.from(Array(gridSize.x)).map((_, x) => Array.from(Array(gridSize.y)).map((_, y) => ({ x, y, id: x + y * gridSize.x })))
        .flat().map(o => ({ 
            left: o.x * (diameter + padding),
            top: o.y * (diameter + padding),
            px: 100 * (0.5 + o.x) / gridSize.x,
            py: 100 * (0.5 + o.y) / gridSize.y,
            hilite: o.id == highlighted,
             ...o}))
        );
    
    function userHilite(id: number, hilite: boolean) {
        if (!enabled) return;
        const item = items.find(o => o.id == id);
        if (item) item.hilite = hilite;
    }
    function onClick(item: {id: number}) {
        console.log("clicked", item.id);
    }
</script>

<h1>WM GRID</h1>

<div>
    <svg viewBox="0 0 100 100" height="300px">
        {#each items as item}
            <circle 
                onmouseenter={e => userHilite(item.id, true)} onmouseleave={e => userHilite(item.id, false)}
                onclick={e => onClick(item)}
                cx="{item.px}%" cy="{item.py}%" r="{0.5 * 100 / (gridSize.x + 1)}%"
                fill={item.hilite ? "red" : "blue"} stroke="black" stroke-width="1"
            />
        {/each}
    </svg>
</div>
