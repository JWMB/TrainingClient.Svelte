import type { IStimuli, IResponseAnalysisResult } from "$lib/nswagclient";
import type { Cmd } from "$lib/presentationCommands";

export interface CommandApi {
    getStimulus(): Promise<{stim: IStimuli, commands: Cmd[]} | null>;
    postResponse(value: any): Promise<{analysis: IResponseAnalysisResult, commands: Cmd[]}>
}
