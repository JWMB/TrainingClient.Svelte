import { UserSessionApiClient, AccountApiClient } from "./nswagclient";

export class ApiWrapper {
	private static instance: ApiWrapper;

	private client: UserSessionApiClient;

	constructor(private baseUrl: string) {
		if (ApiWrapper.instance != null) {
			console.error("ApiWrapper already instantiated");
			this.client = new UserSessionApiClient("");
			return;
			// throw new Error('ApiWrapper already instantiated');
		}
		ApiWrapper.instance = this;

		this.client = new UserSessionApiClient(this.baseUrl, { fetch: (url, init) => fetch(url, init)});
	}

	async login(username: string) {
		const accountClient = new AccountApiClient(this.baseUrl, { fetch: (url, init) => fetch(url, init)});
		const result = await accountClient.login(username);
		// const result = await this.callWithErrorMessage(
		// 	async () => await this.client.login(username)
		// );
		if (!result.sessionId) {
			throw new Error('No sessionId provided');
		}

		this.client = new UserSessionApiClient(this.baseUrl, { 
            fetch: (url, init) => {
                if (!init) init = {};
				const headers = init?.headers ? new Headers(init.headers) : new Headers();
				headers.set("Authorization", `Basic ${btoa(result.sessionId)}`);
				headers.set("sessionId", result.sessionId);
				init.headers = headers;
				init.cache = "no-cache";
                return fetch(url, init);
             }});

		return result;
	}

	async getAvailableActivities() { return await this.call(() =>this.client.availableGames()); }
	async enterGame(gameId: string) { return await this.call(() =>this.client.enterGame(gameId)); }
	async enterPhase(config?: object) { return await this.call(() => this.client.enterPhase(config)); }
	async getConfigurables() { return await this.call(() => this.client.configurables())};
	async nextStimuli() { return await this.call(() => this.client.nextStimuli()); }
	async nextStimuliAndSolution() { return await this.call(() => this.client.nextStimuliAndSolution()); }
	async registerResponse(response: any) { return await this.call(() => this.client.responseExtended(response)); }

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

