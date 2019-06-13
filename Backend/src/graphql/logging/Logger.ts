import { ILogger } from "../types/ILogger";

export class Logger implements ILogger {
    constructor(private id: string, private user: string) {}

    public log(...args: any[]) {
        console.log(`[LOG] [${this.id}] [${this.user}]`, ...args);
    }

    public error(...args: any[]) {
        console.error(`[ERR] [${this.id}] [${this.user}]`, ...args);
    }
}
