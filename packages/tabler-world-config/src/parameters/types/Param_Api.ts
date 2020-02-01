export type Param_Api = {
    host: string;
    key: string;
    batch: number;
    read_batch: number;
    concurrency: {
        read: number;
        write: number;
    };
};
