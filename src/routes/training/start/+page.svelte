<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(async () => {
		// add intro sequence here
		goto('/menu');
	});
</script>

<h1>Start</h1>
