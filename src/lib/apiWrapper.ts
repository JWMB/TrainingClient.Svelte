// import { createPostsClient, type PostsClient } from './client/postsClient';
// import {
// 	AnonymousAuthenticationProvider,
// 	ApiKeyAuthenticationProvider,
// 	ApiKeyLocation
// } from '@microsoft/kiota-abstractions';
// import { FetchRequestAdapter } from '@microsoft/kiota-http-fetchlibrary';

import { ApiClient, LoginResult } from "./nswagclient";

// let apiInstance: ApiWrapper | null = null;
// export function initApi(baseUrl: string) {
// 	if (ApiWrapper.instance) {
// 		throw new Error('ApiWrapper already instanciated');
// 	}
// 	apiInstance = new ApiWrapper(baseUrl);
// }
// export function getApi() {
// 	if (!apiInstance) {
// 		throw new Error('ApiWrapper not initialized');
// 	}
// 	return apiInstance;
// }

export class ApiWrapper {
	static instance: ApiWrapper;

	private client: ApiClient;

	constructor(private baseUrl: string) {
		if (ApiWrapper.instance) {
			throw new Error('ApiWrapper already instanciated');
		}
		ApiWrapper.instance = this;

		this.client = new ApiClient(this.baseUrl, { fetch: (url, init) => fetch(url, init)});
	}

	async login(username: string) {
		const result = await this.callWithErrorMessage(
			async () => await this.client.login(username)
		);
		if (!result.sessionId) {
			throw new Error('No sessionId provided');
		}

		this.client = new ApiClient(this.baseUrl, { 
            fetch: (url, init) => {
                if (!init) init = {};
				const headers = init?.headers ? new Headers(init.headers) : new Headers();
				headers.set("Authorization", `Basic ${btoa(result.sessionId)}`);
				headers.set("sessionId", result.sessionId);
				init.headers = headers;
				init.cache = "no-cache";
				// console.log("init.headers!", init.headers);
                return fetch(url, init);
             }});

		return result;
	}

	async getAvailableActivities() {
		return await this.call(() =>this.client.availableGames());
		// const result = await this.callWithErrorMessage(
		// 	async () => await this.client.availableGames()
		// );
		// return result;
	}
	async enterGame(gameId: string) { return await this.call(() =>this.client.enterGame(gameId)); }
	async enterPhase() { return await this.call(() => this.client.enterPhase(null)); }
	async nextStimuli() { return await this.call(() => this.client.nextStimuli()); }

	protected async call<T>(someCall: () => T | undefined) {
		return await someCall();
	}
	protected async callWithErrorMessage<T>(somecall: () => T | undefined, errorMessage?: string) {
		const result = await somecall();
		if (result == undefined) {
			throw new Error(errorMessage || 'Error!');
		}
		return result;
	}
}

export class ApiWrapperAutologin extends ApiWrapper {
	private username?: string;
	private sessionId?: string;
	constructor(baseUrl: string, defaultUsername: string) {
		super(baseUrl);
		this.username = defaultUsername;
	}
	override async login(username: string) {
		const result = await super.login(username);
		this.sessionId = result.sessionId;
		return result;
	}
	protected override async call<T>(someCall: () => T | undefined) {
		if (this.sessionId == null && this.username) {
			await this.login(this.username);
		}
		return await someCall();
	}
}

