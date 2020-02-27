export type LimitResult = {
    limit: number,
    remaining: number
    rejected: boolean
    retryDelta: number
    forced: boolean,
};

export interface IRateLimiter {
    use(id: string | number, amount?: number): Promise<LimitResult>;
}
