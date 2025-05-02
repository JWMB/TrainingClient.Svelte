<script lang="ts">
	import type { XItem } from "$lib/controllers/qnaController";

    let { item }: 
        { item: XItem | null, } = $props();

</script>

<span>
    {#if item}
    {item.text}
    {#if item.image?.length}
    {#if item.image.indexOf("<svg") === 0}
        <div style="width:40px;height:40px;float:right">
            {@html item.image}
        </div>
    {:else if (item.image.indexOf("data:image") === 0)}
        <img src={item.image} />
    {/if}
    {/if}
    {/if}
</span>    

