<script lang="ts">
	import { onMount, type Component } from "svelte";
	import WmView from "./wmView.svelte";
	import { ServiceProvider } from "$lib/serviceProvider";
	import { WMCircleController, WMGridController, WMNumbersController, type GameController, type WMController } from "$lib/controllers/wmController";
	import { CommandApiProxyWM } from "$lib/commandApis/commandApiProxyWM";

	let api = ServiceProvider.instance.apiWrapper;

	type ComponentAndProps = {
  		component: Component<any>;
		[key: string]: any; // for props
	};
	const components: ComponentAndProps[] = $state([]);

	onMount(async () => {
		const sp = new URLSearchParams(window.location.search);
		const gameId = sp.get("id") || "";
		let controller: GameController | null = null;

		console.log("gameId", gameId);
		const conf = await api.enterGame(gameId); // console.log('conf', conf);
		// TODO: is it here we want to find out which presentation type is suggested from the training settings?
		// maybe we want to know already on menu (e.g. different icons depending on presentation type)
		const enterPhaseResult = await api.enterPhase();
		if (gameId.indexOf("WM_") == 0) {
			const proxyApi = new CommandApiProxyWM(api);
			const wm = gameId == "WM_circle" ? new WMCircleController(enterPhaseResult, proxyApi)
				: (gameId == "WM_numbers" ? new WMNumbersController(enterPhaseResult, proxyApi)
				: new WMGridController(enterPhaseResult, proxyApi));
			controller = wm;
			components.push({ component: WmView, controller: wm });
			//await wm.init(() => { alert("Finished - show summary and return to menu")});
		}

		// if (controller != null) {
		// 	try { await controller.start();
		// 	} catch (err) { }
		// }
	});

</script>

<h1>Activity</h1>
{#each components as item}
	<item.component {...item} />
{/each}
