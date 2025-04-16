import { ApiWrapperAutologin, ApiWrapper } from "./apiWrapper";
import { PUBLIC_BASE_URL, PUBLIC_AUTOLOGIN_USERNAME } from '$env/static/public';
import { AudioMgr } from "./audio";

export class ServiceProvider {
    private static _instance: ServiceProvider;
    static get instance() {
        if (!ServiceProvider._instance) {
            new ServiceProvider();
            // console.log("sdqd", ServiceProvider._instance);
            // throw new Error("ServiceProvider not instantiated");
        }
        return ServiceProvider._instance;
    //     if (!ServiceProvider._instance) {
    //         // console.log("creating ServiceProvider");
    //         ServiceProvider._instance = new ServiceProvider();
    //     }
    //     return ServiceProvider._instance;
    }

    constructor() {
        console.log("ServiceProvider startup");
        if (ServiceProvider._instance != null) {
            console.error("ServiceProvider existed");
        }
        ServiceProvider._instance = this;

        this._audio = new AudioMgr();

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

    private _audio: AudioMgr;
    get audio() { return this._audio; }

    private _apiWrapper: ApiWrapper;
    get apiWrapper() { return this._apiWrapper; }
}