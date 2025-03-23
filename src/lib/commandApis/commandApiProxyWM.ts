import type { ApiWrapper } from "$lib/apiWrapper";
import type { IResponseAnalysisResult } from "$lib/nswagclient";
import type { Cmd, Hilite, Sleep, Enable, Text } from "$lib/presentationCommands";
import type { CommandApi } from "./commandApi";

export class CommandApiProxyWM implements CommandApi {
    constructor(private api: ApiWrapper) {
    }
    private solution: number[] = [];
    private userResponse: number[] = [];

    async getStimulus() {
        const stim = await this.api.nextStimuli();
        if (!stim) {
            return null;
        }
        this.userResponse = [];
        const sequence = (<any>stim).sequence as number[]; // TODO: typing
        this.solution = sequence; // TODO: no - get from server, could be reversed or otherwise manipulated 
        return { stim: stim, commands: this.getSequenceCommands(sequence) };
    }

    async postResponse(value: any) {
        if (typeof value === "number") {
            let analysis = this.analyzeResponse(value);
            if (analysis.isFinished) {
                const tmp = await this.api.registerResponse(this.userResponse);
                if (!tmp) throw new Error("");
                // TODO: doing something incorrect on server ATM... 
                // analysis = tmp;
            }
            const commands = analysis.isCorrect
                ? []
                : this.getBlinkCommands(this.solution[this.userResponse.length - 1]);
            return { analysis, commands };
        } else {
            throw new Error("Not a number");
        }
    }

    private analyzeResponse(value: number): IResponseAnalysisResult {
        this.userResponse.push(value);
        if (this.userResponse.length > this.solution.length) {
            console.warn("huh?");
            return <IResponseAnalysisResult>{ isFinished: true, isCorrect: false };
        } else {
            const correct = value == this.solution[this.userResponse.length - 1];
            return <IResponseAnalysisResult>{ 
                isFinished: correct ? this.userResponse.length == this.solution.length : true,
                isCorrect: correct };
        }
    }

    private getBlinkCommands(id: number): Cmd[] {
        return Array.from(Array(4)).map(_ => [
            <Hilite>{ type:"hilite", id: id, on: true},
            <Sleep>{ type:"sleep", timeMs: 100},
            <Hilite>{ type:"hilite", id: id, on: false},
            <Sleep>{ type:"sleep", timeMs: 100},
        ]).flat().concat([
            <Sleep>{ type:"sleep", timeMs: 1000}
        ]);
    }
    private getSequenceCommands(sequence: number[]): Cmd[] {
        const forItems = sequence.map(o => [
            <Hilite>{ type:"hilite", id: o, on: true},
            <Sleep>{ type:"sleep", timeMs: 1000},
            <Hilite>{ type:"hilite", id: o, on: false},
            <Sleep>{ type:"sleep", timeMs: 500},
        ]).flat();

        return (<Cmd[]>[
            <Enable>{ type: "enable", value: false },
        ])
        .concat(forItems)
        .concat([
            <Text>{ type: "text", value: "Your turn" },
            <Enable>{ type: "enable", value: true },
            <Sleep>{ type:"sleep", timeMs: 1000},
            <Text>{ type: "text", value: "" },
        ]);
    }
}
