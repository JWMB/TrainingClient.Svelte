<script lang="ts">
	// import { getApi } from "$lib/apiWrapper";
	import { onMount, type Component } from "svelte";
	import WmView from "./wmView.svelte";
	import { ServiceProvider } from "$lib/serviceProvider";
	import { WMGridController, type GameController, type WMController } from "./wm";

	// let component: Component | null = null;
	let api = ServiceProvider.instance.apiWrapper;

	// let wmComponent: WmView;
	let controller: GameController | null;
	//let wm: WMController | null = $state(null); //new WMGridController({x: 4, y: 4});
	let wm = new WMGridController({x: 4, y: 4}, api);

	// async function nextStimuli() {
	// 	const stim = await api.nextStimuli();
	// 	if (stim) {
	// 		if (controller) {
	// 			await controller.present(stim); //console.log('stim', stim);
	// 		}
	// 	} else {
	// 		// no more stimuli - exit to menu
	// 	}
	// }

	onMount(async () => {
		const sp = new URLSearchParams(window.location.search);
		const gameId = sp.get("id") || "";

		console.log("gameId", gameId);
		const conf = await api.enterGame(gameId); // console.log('conf', conf);
		if (gameId == "WM_grid") {
			// TODO: instantiate WMGridController here using size from server
			// TODO: instantiate WmView here
			//wm = new WMGridController({x: 4, y: 4});
			controller = wm;
			// wm.onResponse = async (id: number) => {
			// 	 console.log("received", id);
			// 	 const analysis = await api.registerResponse(id);
			// 	 console.log("analysis", analysis);
			// 	 if (analysis?.isCorrect) {
			// 		// wm.
			// 	 }
			// 	 if (analysis?.isFinished) {
			// 		await nextStimuli();
			// 	 }
			// };
			await wm.init(() => {alert("Finished - show summary and return to menu")});
		}
		const enterPhaseResult = await api.enterPhase(); // console.log("ep", enterPhaseResult);

		try {
			await wm.start();
		} catch (err) {

		}

	});

</script>

<h1>Activity</h1>
<WmView controller={wm} ></WmView> <!--bind:this={wmComponent} -->
<!-- <svelte:component this={component} /> -->