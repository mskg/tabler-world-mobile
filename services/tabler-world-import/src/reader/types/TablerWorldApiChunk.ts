export type TablerWorldApiChunk<T = any> = {
    data: T[];
    next?: string;
    total: number;
    offset: number;
} | undefined;
