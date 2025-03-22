<script lang="ts">
	import { goto } from '$app/navigation';
	import { ServiceProvider } from '$lib/serviceProvider';
	// import { ApiWrapper, getApi } from '$lib/apiWrapper';

	let userId = $state('');
	// let api = getApi();
	let api = ServiceProvider.instance.apiWrapper;

	async function onLogin() {
		const result = await api.login(userId);
		console.log('result', userId, result);
		if (result) {
			goto('/training/menu');
		}
	}
</script>

<h1>Login</h1>
<label>User id<input bind:value={userId} /></label>
<p>{userId}</p>
<button onclick={onLogin}>Login</button>
