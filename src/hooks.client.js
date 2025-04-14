import { ServiceProvider } from '$lib/serviceProvider';

/** @type {import('@sveltejs/kit').ServerInit} */
export async function init() {
    console.log("hooks.client.js");
    const sp = new ServiceProvider();
}