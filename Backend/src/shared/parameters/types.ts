export type Param_Database = {
    database: string,
    host: string,
    user: string,
    password?: string,
    port?: number,
    ssl?: boolean,
}

export type Param_Api = {
    host: string,
    key: string,

    batch: number,
    read_batch: number,
}