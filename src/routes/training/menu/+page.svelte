<script lang="ts">
	import { goto } from '$app/navigation';
	// import { getApi } from '$lib/apiWrapper';
	import type { GameDefinition } from '$lib/nswagclient';
	import { ServiceProvider } from '$lib/serviceProvider';
	//import type { GameDefinition } from '$lib/client/models';
	import { onMount } from 'svelte';

	let activities: GameDefinition[] = $state([]);

	// let api = getApi();
	let api = ServiceProvider.instance.apiWrapper;
	onMount(async () => {
		activities = (await api.getAvailableActivities()) || [];
		// console.log('activities', activities);
	});

	function onStartActivity(activityId: string) {
		goto(`/training/activity/?id=${activityId}`);
	}
</script>

<h1>Menu</h1>
{#each activities as activity}
	<button class="button-62" onclick={() => onStartActivity(activity.id || 'unknown')}
		>{activity.title || 'unknown'}</button
	>
{/each}
