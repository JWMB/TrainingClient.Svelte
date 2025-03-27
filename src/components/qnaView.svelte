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

        typedController().signals.clear.add(() => {
            alternatives = [];
        });
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

    const respond = (answer: string) => typedController().respond(answer);
    const onKeydown = (key: string) => {
        if (key === "Enter") {
            // console.log("AA", answer);
            respond(answer);
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
        <div>Your answer:</div>
        {#each alternatives as alt}
            <button onclick={() => respond(alt)}>{alt}</button>         
        {/each}
        {#if alternatives.length === 0}
            <input onkeydown={e => onKeydown(e.key)} type="text" bind:value={answer}/>
        {/if}
    </div>

</div>