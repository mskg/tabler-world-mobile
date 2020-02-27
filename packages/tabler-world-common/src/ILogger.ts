export interface ILogger {
    category?: string;

    log(...args: any[]): void;
    error(...args: any[]): void;
}
