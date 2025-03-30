<script lang="ts">
	import type { NVRController } from "$lib/controllers/nvrController";
	import { onMount } from "svelte";

    let { controller }: 
    { controller: NVRController | null, } = $props();

    function typedController() { return controller as NVRController; }

    type Card = { svg: string, id: number };

    let questionCards: Card[] = $state([]);
    let answerCards: Card[] = $state([]);

    let answer: string = $state("");

    onMount(async () => {
        if (!typedController()) {
            console.warn("No ctrl");
            return;
        }

        // typedController().signals.clear.add(() => {
        //     alternatives = [];
        // });
        typedController().signals.addItem.add(arg => {
            // console.log("addItem", arg.item);
            const card: Card = { id: parseInt(arg.item.id, 10), svg: arg.item.text || "" };
            if (arg.item.type == "Q") {
                questionCards.push(card);
            } else {
                answerCards.push(card);
            }
        });
        // typedController().signals.enable.add(arg => enabled = arg.value);
    });

    // const respond = (answer: string) => typedController().respond(answer);
    // const onKeydown = (key: string) => {
    //     if (key === "Enter") {
    //         // console.log("AA", answer);
    //         respond(answer);
    //     }
    // }
</script>

<div>
    <div>
        {#each questionCards as card}
            {@html card.svg}
        {/each}
    </div>

    <div>
        {#each answerCards as card}
            {@html card.svg}
        {/each}
    </div>

</div>