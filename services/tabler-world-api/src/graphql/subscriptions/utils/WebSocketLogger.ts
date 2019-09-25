import { ILogger } from '@mskg/tabler-world-common';

export class WebsocketLogger implements ILogger {
    private categories: any[];

    constructor(...categories: any[]) {
        this.categories = categories || [];
    }

    public log(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.log(`[LOG]${this.categories.map((c: any) => ' [' + c + ']').join(' ')}`, ...args);
    }
    public error(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.log(`[ERR]${this.categories.map((c: any) => ' [' + c + ']').join(' ')}`, ...args);
    }
}
