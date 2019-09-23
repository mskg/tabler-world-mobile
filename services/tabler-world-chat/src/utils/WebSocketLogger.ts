import { ILogger } from '@mskg/tabler-world-common';

export class WebSocketLogger implements ILogger {
    private categories: any[];

    constructor(...categories: any[]) {
        this.categories = categories || [];
    }

    public log(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.log(`[LOG]${this.categories.map((c: any) => ' [' + c + ']')}`, ...args);
    }
    public error(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.log(`[ERR]${this.categories.map((c: any) => ' [' + c + ']')}`, ...args);
    }
}
