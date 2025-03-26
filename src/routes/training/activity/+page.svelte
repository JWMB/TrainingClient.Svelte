<script lang="ts">
	import { onMount, type Component } from "svelte";
	import WmView from "../../../components/wmView.svelte";
	import { ServiceProvider } from "$lib/serviceProvider";
	import { WMCircleController, WMGridController, WMMovingController, WMNumbersController, type GameController, type WmViewFunctions } from "$lib/controllers/wmController";
	import { CommandApiProxyWM } from "$lib/commandApis/commandApiProxyWM";
	import LevelMeter from "../../../components/levelMeter.svelte";
	import ProgressMeter from "../../../components/progressMeter.svelte";
	import { QnAController } from "$lib/controllers/qnaController";

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
		const enterPhaseResultEx = await api.enterPhase();
		if (enterPhaseResultEx == null) throw new Error("No enterphase result");
		const enterPhaseResult = enterPhaseResultEx.enterPhaseResult;

		if (gameId == "QnA") {
			controller = new QnAController();
			components.push({ component: WmView, controller: controller });

		} else if (gameId.indexOf("WM_") == 0) {
			const proxyApi = new CommandApiProxyWM(api);
			const wm = gameId == "WM_circle" ? new WMCircleController(enterPhaseResult, proxyApi)
				: (gameId == "WM_numbers" ? new WMNumbersController(enterPhaseResult, proxyApi)
				: (gameId == "WM_moving" ? new WMMovingController(enterPhaseResult, proxyApi)
				: new WMGridController(enterPhaseResult, proxyApi)));
			
			const viewFunctions = {
				hilite: null, add: null, enable: null,
				showText: v => textMessage = v,
				updateLevel: (current, top) => { levelInfo.current = current; levelInfo.top = top; },
				updateProgress: (target, fail, end) => { progressInfo.targetPercentage = target; progressInfo.failPercentage = fail, progressInfo.endPercentage = end; },
			} as WmViewFunctions;
			wm.registerView(viewFunctions);
			controller = wm;
			components.push({ component: WmView, controller: controller });
			
			const meta = enterPhaseResultEx.meta;
			viewFunctions.updateLevel && viewFunctions.updateLevel(meta.level.current, meta.level.top);
			viewFunctions.updateProgress && viewFunctions.updateProgress(meta.progress.targetPercentage, meta.progress.failPercentage, meta.progress.endPercentage);
			//await wm.init(() => { alert("Finished - show summary and return to menu")});
		} else {
			throw new Error(`No implementation for game ${gameId}`);
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
