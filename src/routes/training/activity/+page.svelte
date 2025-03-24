<script lang="ts">
	import { onMount, type Component } from "svelte";
	import WmView from "./wmView.svelte";
	import { ServiceProvider } from "$lib/serviceProvider";
	import { WMCircleController, WMGridController, WMMovingController, WMNumbersController, type GameController, type WMController } from "$lib/controllers/wmController";
	import { CommandApiProxyWM } from "$lib/commandApis/commandApiProxyWM";
	import LevelMeter from "../../../components/levelMeter.svelte";
	import ProgressMeter from "../../../components/progressMeter.svelte";

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
				: (gameId == "WM_moving" ? new WMMovingController(enterPhaseResult, proxyApi)
				: new WMGridController(enterPhaseResult, proxyApi)));
			wm.registerView({
				hilite: null, add: null, enable: null,
				showText: v => textMessage = v,
				updateLevel: (current, top) => { levelInfo.current = current; levelInfo.top = top; },
				updateProgress: (target, fail, end) => { progressInfo.targetPercentage = target; progressInfo.failPercentage = fail, progressInfo.endPercentage = end; },			});
			controller = wm;
			components.push({ component: WmView, controller: wm });
			//await wm.init(() => { alert("Finished - show summary and return to menu")});
		}

		// if (controller != null) {
		// 	try { await controller.start();
		// 	} catch (err) { }
		// }
	});
	let levelInfo: { current: number, top: number }
        = $state({ current: 0, top: 0});
    let progressInfo: { targetPercentage: number, failPercentage: number, endPercentage: number}
        = $state({targetPercentage: 0, failPercentage: 0, endPercentage: 0});
    let textMessage: string = $state("");

</script>

<LevelMeter current={levelInfo.current} top={levelInfo.top}></LevelMeter>
<ProgressMeter target={progressInfo.targetPercentage} fail={progressInfo.failPercentage} end={progressInfo.endPercentage} ></ProgressMeter>

{#each components as item}
	<item.component {...item} />
{/each}

<h2>{textMessage}</h2>
