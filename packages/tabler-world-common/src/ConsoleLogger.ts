import { ILogger } from './ILogger';

export class ConsoleLogger implements ILogger {
    // tslint:disable-next-line: function-name
    public static extend(logger: ILogger, newCategory: string) {
        return new ConsoleLogger(logger.category, newCategory);
    }

    public category: string;

    constructor(...categories: any[]) {
        this.category = (categories || [])
            .filter(Boolean)
            .map((c: string) => c.toString().startsWith('[') ? c : `[${c}]`).join(' ');
    }

    public log(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.log(this.category, ...args);
    }

    public error(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.error(this.category, ...args);
    }
}
