<script lang="ts">
	// import { getApi } from "$lib/apiWrapper";
	import { onMount, type Component } from "svelte";
	import Wm from "./wm.svelte";
	import { ServiceProvider } from "$lib/serviceProvider";

	let component: Component | null = null;
    // let api = getApi();
	let api = ServiceProvider.instance.apiWrapper;

	onMount(async () => {
		const sp = new URLSearchParams(window.location.search);
		const gameId = sp.get("id") || "";

		console.log("gid", gameId);
		if (gameId == "WM_grid") {
			component = Wm;
		}
		const conf = await api.enterGame(gameId); // console.log('conf', conf);
		const enterPhaseResult = await api.enterPhase(); // console.log("ep", enterPhaseResult);

		const stim = await api.nextStimuli();
		console.log('stim', stim);
	});

</script>

<h1>Activity</h1>
<Wm></Wm>
<svelte:component this={component} />