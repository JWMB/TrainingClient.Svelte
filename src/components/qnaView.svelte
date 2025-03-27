<script lang="ts">
	import type { QnAController } from "$lib/controllers/qnaController";
	import { onMount } from "svelte";

    let { controller }: 
    { controller: QnAController | null, } = $props();

    function typedController() { return controller as QnAController; }

    let question: string = $state("");
    let alternatives: string[] = $state([]);

    let answer: string = $state("");

    onMount(async () => {
        if (!typedController()) {
            console.warn("No ctrl");
            return;
        }

        typedController().signals.addItem.add(arg => {
            // console.log("addItem", arg.item);
            if (arg.item.type === "question") {
                question = arg.item.text || "N/A";
            } else if (arg.item.type === "alternative") {
                alternatives.push(arg.item.text || "N/A");
            } else if (arg.item.type === "input") {
                answer = "";
            } else {
            }
        });
        // typedController().signals.enable.add(arg => enabled = arg.value);
    });

    const onKeydown = (key: string) => {
        if (key === "Enter") {
            // console.log("AA", answer);
            typedController().respond(answer);
        }
    }
</script>

<div>
    <div>
        <br/>
        Here is the question:
        <h2>{question}</h2>
    </div>

    <div>
        {#each alternatives as alt}
            <h3>{alt}</h3>            
        {/each}
        {#if alternatives.length === 0}
            <div>Your answer:</div>
            <input onkeydown={e => onKeydown(e.key)} type="text" bind:value={answer}/>
        {/if}
    </div>

</div>