export type CacheValues<T> = {
    [key: string]: T;
};

export type CacheKeyOptions = {
    ttl?: number;
};

export interface ICacheOptions {
    ttl?: number;
}

export type CacheData<T> = {
    id: string;
    data: T;
    options?: CacheKeyOptions;
};

export interface IManyKeyValueCache<T> {
    getMany(ids: T[]): Promise<CacheValues<T>>;
    setMany(data: CacheData<T>[]): Promise<void>;
}

export type DefaultCacheType = IManyKeyValueCache<string>;
