<script lang="ts">
	import { onMount, type Component } from "svelte";
	import WmView from "../../../components/wmView.svelte";
	import { ServiceProvider } from "$lib/serviceProvider";
	import { WMCircleController, WMGridController, WMMovingController, WMNumbersController, type GameController, type WmViewFunctions } from "$lib/controllers/wmController";
	import LevelMeter from "../../../components/levelMeter.svelte";
	import ProgressMeter from "../../../components/progressMeter.svelte";
	import { QnAController } from "$lib/controllers/qnaController";
	import QnaView from "../../../components/qnaView.svelte";

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

		if (gameId == "QnA") {
			controller = new QnAController();
			components.push({ component: QnaView, controller: controller });

		} else if (gameId.indexOf("WM_") == 0) {
			const wm = gameId == "WM_circle" ? new WMCircleController(api)
				: (gameId == "WM_numbers" ? new WMNumbersController(api)
				: (gameId == "WM_moving" ? new WMMovingController(api)
				: new WMGridController(api)));
			
			controller = wm;
			components.push({ component: WmView, controller: controller });
			
		} else {
			throw new Error(`No implementation for game ${gameId}`);
		}

		controller.showTextSignal.add(arg => textMessage = arg.value);
		controller.levelUpdateSignal.add(arg => { levelInfo.current = arg.current; levelInfo.top = arg.top; });
		controller.progressUpdateSignal.add(arg => {
			progressInfo.targetPercentage = arg.target;
			progressInfo.failPercentage = arg.fail,
			progressInfo.endPercentage = arg.end;
		});
		await controller.init(() => { alert("Finished - show summary and return to menu")});
		await controller.start();

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
