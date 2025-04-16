export class AudioMgr {
    private static _instance: AudioMgr;
    public static get i() { return AudioMgr._instance; }

    private ctx?: AudioContext;
    private preloaded: Map<string, AudioBuffer>;

    constructor() {
        if (AudioMgr._instance) {
            console.error("Audio singleton - why reinitialied?"); //throw new Error("Audio singleton");
        } else {
            AudioMgr._instance = this;
        }

        this.preloaded = new Map<string, AudioBuffer>();
    }

    private get context() {
        if (this.ctx) return this.ctx;
        try {
            this.ctx = new AudioContext();
            return this.ctx;
        } catch (err) {
            console.warn("No ctx", err);
            return null;
        }
    }

    async play(idOrFile: string, options?: { pitch?: number }) {
        const ctx = this.context;
        if (!ctx) return;

        const buf = await this.getOrFetch(idOrFile);
        if (!buf) return;
        const playSound = ctx.createBufferSource();
        console.log("options", options);
        if (options) {
            if (options.pitch != null) {
                playSound.playbackRate.value = options.pitch;
            }
        }
        playSound.buffer = buf;
        playSound.connect(ctx.destination);
        playSound.start(ctx.currentTime);
    }

    private async getOrFetch(idOrFile: string, keep: boolean = false) {
        if (!this.ctx) throw new Error("No ctx");
        const found = this.preloaded.get(idOrFile);
        if (found) return found;
        try {
            const response = await fetch(idOrFile);
            const buf = await response.arrayBuffer();
            const decoded = await this.ctx.decodeAudioData(buf);
            if (keep) {
                this.preloaded.set(idOrFile, decoded);
            }
            return decoded;    
        } catch (err) {
            console.warn("", idOrFile, err);
            return null;
        }
    }
}

export class Sound {
}