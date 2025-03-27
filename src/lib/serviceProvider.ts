import { ApiWrapperAutologin, ApiWrapper } from "./apiWrapper";
import { PUBLIC_BASE_URL, PUBLIC_AUTOLOGIN_USERNAME } from '$env/static/public';

export class ServiceProvider {
    private static _instance: ServiceProvider;
    static get instance() {
        if (!ServiceProvider._instance) {
            ServiceProvider._instance = new ServiceProvider();
        }
        return ServiceProvider._instance;
    }

    private _apiWrapper?: ApiWrapper;
    get apiWrapper(): ApiWrapper {
        if (!this._apiWrapper) {
            // TODO: from env files
            const baseUrl = PUBLIC_BASE_URL;
            const autologinUsername = PUBLIC_AUTOLOGIN_USERNAME;
            // const baseUrl = "https://localhost:7206";
            // const autologinUsername = "testuser";
            if (autologinUsername) {
                this._apiWrapper = new ApiWrapperAutologin(baseUrl, autologinUsername);
            } else {
                this._apiWrapper = new ApiWrapper(baseUrl);
            }
        }
        return this._apiWrapper;
    }
}