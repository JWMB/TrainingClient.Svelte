<script lang="ts">
	import type { QnAController, XItem } from "$lib/controllers/qnaController";
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
    let alternatives: XItem[] = $state([]);

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
        typedController().signals.addItemsX.add(arg => {
            for (let item of arg.items) {
                // console.log("item", item);
                if (item.image) {
                    if (item.image.indexOf("<svg") === 0) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(item.image, "image/svg+xml");
                        const svg = doc.getElementsByTagNameNS("http://www.w3.org/2000/svg", "svg").item(0);
                        if (svg) {
                            svg.setAttribute("width", "100%");
                            svg.setAttribute("height", "100%");
                            item.image = svg.outerHTML;
                        }
                    }
                }
                if (item.type === "question") {
                    question = item.text || "N/A";
                } else if (item.type === "alternative") {
                    alternatives.push(item); //item.text || "N/A");
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
    const respond = (answer?: string) => typedController().respond(answer || "");
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
        <h2>{question}</h2>
    </div>

    <div style="display: block; max-width:200px">
        {#each alternatives as alt}
            <div style="flex: 1">
                <span>
                <button class="button-62" onclick={() => respond(alt.text)}>{alt.text || "N/A"}</button>  
                {#if alt.image?.length}
                    {#if alt.image.indexOf("<svg") === 0}
                        <div style="width:40px;height:40px;float:right">
                            {@html alt.image}
                        </div>
                    {/if}
                {/if}
                </span>
            </div>
        {/each}
        {#if alternatives.length === 0}
            <input onkeydown={e => onKeydown(e.key)} type="text" bind:value={answer}/>
        {/if}
    </div>
</div>
