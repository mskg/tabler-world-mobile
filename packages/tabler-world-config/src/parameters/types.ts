export type Param_Database = {
    database: string,
    host: string,
    user: string,
    password?: string,
    port?: number,
    ssl?: boolean,
};

export type Param_Api = {
    host: string,
    key: string,

    batch: number,
    read_batch: number,
};

export type Param_Nearby = {
    radius: number,
    days: number,
};

export type Param_TTLS = {
    MemberOverview: number,
    ClubMembers: number,

    Member: number,
    Structure: number,

    StructureOverview: number,
    Albums: number,
    Documents: number,
    News: number,
};

export type Param_Chat = {
    ttl: number,
    eventsPageSize: number,
    masterKey: string,
};
