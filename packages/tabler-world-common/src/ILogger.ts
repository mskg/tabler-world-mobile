export interface ILogger {
    category?: string;

    debug(...args: any[]): void;
    log(...args: any[]): void;
    error(...args: any[]): void;
    warn(...args: any[]): void;
}
