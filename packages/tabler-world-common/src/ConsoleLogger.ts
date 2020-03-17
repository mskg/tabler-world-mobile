import { ILogger } from './ILogger';

export class ConsoleLogger implements ILogger {
    static debugDisabled = process.env.DEBUG_LOG_DISABLED === 'true';

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

    public debug(...args: any[]) {
        if (ConsoleLogger.debugDisabled) { return; }

        // tslint:disable-next-line: prefer-template
        console.debug(this.category, ...args);
    }

    public log(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.log(this.category, ...args);
    }

    public warn(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.warn(this.category, ...args);
    }

    public error(...args: any[]) {
        // tslint:disable-next-line: prefer-template
        console.error(this.category, ...args);
    }
}
