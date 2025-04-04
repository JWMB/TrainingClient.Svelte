<script lang="ts">
	import type { NVRController } from "$lib/controllers/nvrController";
	import { onMount } from "svelte";

    let { controller }: 
    { controller: NVRController | null, } = $props();

    function typedController() { return controller as NVRController; }

    type Card = { svg: string, id: number, x: number, y: number };

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
        typedController().signals.addItems.add(arg => {
            // console.log("addItem", arg);
            for (let item of arg.items) {
                console.log("itemx", item.type);
                const card: Card = { id: parseInt(item.id, 10), x: item.x, y: item.y, svg: item.text || "" };
                if (item.type == "Q") {
                    questionCards.push(card);
                } else {
                    answerCards.push(card);
                }
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
        <div style="outline: solid; box-shadow: 5px 5px 5px gray; position: absolute; left:{card.x * 120}px; top:{100 + card.y * 120}px;">
            {@html card.svg}
        </div>
        {/each}
    </div>

    <div>
        {#each answerCards as card}
        <div style="outline: solid; box-shadow: 5px 5px 5px gray; position: absolute; left:{card.x * 120}px; top:{100 + ((card.y + 2) * 120)}px;">
            {@html card.svg}
        </div>
        {/each}
    </div>

</div>