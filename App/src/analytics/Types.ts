import { ActionNames } from './ActionNames';
import { AuditPropertyNames } from './AuditPropertyNames';
import { MetricNames } from "./MetricNames";

export interface IAuditor extends IAuditSubmit {
    increment(metric: MetricNames);
    setParam(name: AuditPropertyNames, value: string | string[]);
    trackAction(action: ActionNames, params?: Params);
}

export interface IAuditSubmit {
    submit(params?: Params, metrics?: Metrics);
};

export type Params = {
    [key in AuditPropertyNames]?: string | string[];
};

export type Metrics = {
    [key in MetricNames]?: number;
};