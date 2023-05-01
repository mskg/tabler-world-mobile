export type Param_Api = {
    host: string;

    keys: {
        rti: string,
        lci: string,
        c41: string,
        aci: string,
        tci: string,
    };

    batch: number;
    read_batch: number;

    concurrency: {
        read: number;
        write: number;
    };
};
