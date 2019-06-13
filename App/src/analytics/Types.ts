import { Categories, Logger } from '../helper/Logger';

export interface IAuditor extends IAuditSubmit {
    increment(metric: string);
    setParam(name: string, value: string | string[]);
    trackAction(action: string, params?: Params);
}

export interface IAuditSubmit {
    submit(params?: Params, metrics?: Metrics);
}

export const logger = new Logger(Categories.Audit);

export type Params = {
    [key: string]: string | string[],
}

export type Metrics = {
    [key: string]: number,
}

