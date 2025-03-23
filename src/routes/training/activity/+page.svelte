<script lang="ts">
	import { onMount } from "svelte";
	import WmView from "./wmView.svelte";
	import { ServiceProvider } from "$lib/serviceProvider";
	import { WMGridController, type GameController } from "$lib/controllers/wmController";
	import { CommandApiProxyWM } from "$lib/commandApis/commandApiProxyWM";

	// let component: Component | null = null;
	let api = ServiceProvider.instance.apiWrapper;

	// let wmComponent: WmView;
	let controller: GameController | null;
	//let wm: WMController | null = $state(null);
	let wm = new WMGridController({x: 4, y: 4}, new CommandApiProxyWM(api));

	onMount(async () => {
		const sp = new URLSearchParams(window.location.search);
		const gameId = sp.get("id") || "";

		console.log("gameId", gameId);
		const conf = await api.enterGame(gameId); // console.log('conf', conf);
		// TODO: is it here we want to find out which presentation type is suggested from the training settings?
		// right now WmView is hard-coded
		// maybe we want to know already on menu (e.g. different icons depending on presentation type)
		if (gameId == "WM_grid") {
			controller = wm;
			await wm.init(() => { alert("Finished - show summary and return to menu")});
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