export type Param_Api = {
    host: string;

    keys: {
        rti: string,
        lci: string,
    };

    batch: number;
    read_batch: number;

    concurrency: {
        read: number;
        write: number;
    };
};
