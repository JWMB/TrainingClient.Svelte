<script lang="ts">
    import { Tween } from "svelte/motion";
    let {
        value = 0,
        animationDelay = 0,
        animationDuration = 400,
        min = 0,
        max = 100,
        prefix = "",
        suffix = "%",
        decimals = 1,
        color = "#ffff00",
        height = 25,
        initialAnimation = true,
        showSteps = true,
        stepSize = 1,
        showValueAs = "All" as 'All' | 'Percentage' | 'OnlyValue' | 'ValueWithSuffix' | 'None'
    } = $props();

    let currentValue = new Tween(initialAnimation ? 0 : value, {
		duration: animationDuration,
		delay: animationDelay
    });

    $effect(() => { currentValue.set(value); });

    let steps = $derived(getSteps(value, 0, max));
	function getSteps(currentValue: number, min: number, max: number) {
		const list: number[] = [];
		for (let i = min; i < max; i += stepSize) {
			const percentage = (i - min) / (max - min);
			if (percentage) {
				list.push(percentage);
			}
		}
		return list;
	}

    let valueString = $derived(getString(value, max, prefix, suffix, decimals, showValueAs));
	function getString(
		value: number,
		max: number,
		prefix: string,
		suffix: string,
		decimals: number,
		showValueAs: string
	) {
		switch (showValueAs) {
			case 'All':
				return prefix + value.toFixed(decimals) + '/' + max.toFixed(decimals) + suffix;
			case 'Percentage':
				return prefix + getPercentage(value, max).toFixed(decimals) + suffix;
			case 'OnlyValue':
				return value.toFixed(decimals);
			case 'ValueWithSuffix':
				return prefix + value.toFixed(decimals) + suffix;
			case 'None':
				return '';
		}
	}

    let percentage = $derived(getPercentage(currentValue.current - min, max - min));
	function getPercentage(value: number, max: number) {
		return (value / max) * 100 || 0;
	}
</script>

<div class="progress-bar" style:--progress-height={height + 'px'}>
	<div class="background" ></div>
	<div class="progress" style:--progress-color={color} style:width={percentage + '%'} ></div>
	{#if showSteps}
		{#each steps as step}
			<div class="step" style:left="{step * 100}%" ></div>
		{/each}
	{/if}
	<div class="value">{valueString}</div>
</div>

<style>
	.progress-bar {
		height: var(--progress-height);
		border: var(--progress-border, 2px solid #ffffff);
		border-radius: 20px;
		overflow: hidden;
		position: relative;
	}
	.background {
		background-color: var(--progress-background, #eeeeee);
		position: absolute;
		top: 0;
		bottom: 0;
		height: 100%;
		width: 100%;
	}
	.progress {
		background: var(--progress-color);
		position: absolute;
		top: 0;
		bottom: 0;
		height: 100%;
		transition: width 0.3s;
	}
	.value {
		display: flex;
		align-items: center;
		position: absolute;
		top: 0;
		bottom: 0;
		left: 8px;
		font-size: 12px;
		color: var(--text-color, rgba(0, 0, 0, 0.51));
	}
	.step {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 2px;
		background-color: #00000030;
	}
</style>