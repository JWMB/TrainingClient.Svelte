<script lang="ts">
	// import { getApi } from "$lib/apiWrapper";
	import { onMount, type Component } from "svelte";
	import WmView from "./wmView.svelte";
	import { ServiceProvider } from "$lib/serviceProvider";
	import { WMGridController, type WMController } from "./wm";

	// let component: Component | null = null;
	let api = ServiceProvider.instance.apiWrapper;

	let wmComponent: WmView;WMGridController
	const wm: WMController = new WMGridController({x: 4, y: 4});

	onMount(async () => {
		const sp = new URLSearchParams(window.location.search);
		const gameId = sp.get("id") || "";

		console.log("gameId", gameId);
		if (gameId == "WM_grid") {
			// TODO: create W
			wm.init();
		}
		const conf = await api.enterGame(gameId); // console.log('conf', conf);
		const enterPhaseResult = await api.enterPhase(); // console.log("ep", enterPhaseResult);

		const stim = await api.nextStimuli();
		if (stim) {
			wm.present(stim); //console.log('stim', stim);
		}
	});

</script>

<h1>Activity</h1>
<WmView controller={wm} bind:this={wmComponent} ></WmView>
<!-- <svelte:component this={component} /> -->