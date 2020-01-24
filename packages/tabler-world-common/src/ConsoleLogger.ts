import { ILogger } from './ILogger';

export class ConsoleLogger implements ILogger {
    private category: string;

    constructor(...categories: any[]) {
        this.category = (categories || []).map((c: any) => `[${c}]`).join(' ');
    }

    public log(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.log(`[LOG] ${this.category}`, ...args);
    }

    public error(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.log(`[ERR] ${this.category}`, ...args);
    }
}
