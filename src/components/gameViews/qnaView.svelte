<script lang="ts">
	import type { QnAController } from "$lib/controllers/qnaController";
	import { onMount } from "svelte";
	import Dropdown from "../dropdown.svelte";

    let { controller }: 
    { controller: QnAController | null, } = $props();

    function typedController() { return controller as QnAController; }

    // let dataUrl: string = $state("https://localhost/abc.tsv");
    // let dataUrls = [ "https://google.com" ];
    let dataUrl: string = $state("");
    let dataUrls: string[] = $state([]);

    let question: string = $state("");
    let alternatives: string[] = $state([]);

    let answer: string = $state("");

    onMount(async () => {
        if (!typedController()) {
            console.warn("No ctrl");
            return;
        }

        typedController().signals.init.add(() => {
            dataUrls = typedController().previousDataUrls;
            // console.log("SdataUrls", dataUrls);
        });
        typedController().signals.clear.add(() => {
            alternatives = [];
        });
        typedController().signals.addItems.add(arg => {
            // console.log("addItem", arg.item);
            for (let item of arg.items) {
            if (item.type === "question") {
                    question = item.text || "N/A";
                } else if (item.type === "alternative") {
                    alternatives.push(item.text || "N/A");
                } else if (item.type === "input") {
                    answer = "";
                } else {
                }
            }
        });
        // typedController().signals.enable.add(arg => enabled = arg.value);
    });

    const load = () => { 
        //console.log("data", dataUrl);
        if (dataUrl) {
            controller?.reload(dataUrl)
                .then(() => controller?.start());
        }
     };
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
        <Dropdown bind:value={dataUrl} alternatives={dataUrls}></Dropdown>
        <input type="button" value="Load" onclick={load} />
    </div>
    <div>
        <br/>
        Here is the question:
        <h2>{question}</h2>
    </div>

    <div>
        <div>Your answer:</div>
        {#each alternatives as alt}
            <button class="button-62" onclick={() => respond(alt)}>{alt}</button>         
        {/each}
        {#if alternatives.length === 0}
            <input onkeydown={e => onKeydown(e.key)} type="text" bind:value={answer}/>
        {/if}
    </div>

</div>