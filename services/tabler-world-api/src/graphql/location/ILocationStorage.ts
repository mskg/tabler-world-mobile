import { DataSourceConfig } from 'apollo-datasource';
import { IApolloContext } from '../types/IApolloContext';

export type QueryResult = QueryResultRecord[];
export type QueryResultRecord = {
    member: number,
    lastseen: Date,

    speed: number,
    accuracy: number,

    address: any,

    position: Location,
    distance: number,
    canshowonmap: boolean,
};

export type PutLocation = {
    longitude: number;
    latitude: number;
    member: number;
    club: string;
    association: string;
    family: string;
    lastseen: Date;
    speed: number;
    accuracy: number;
    address?: any;
};

export type Location = {
    longitude: number,
    latitude: number,
};

export interface ILocationStorage {
    initialize?(config: DataSourceConfig<IApolloContext>): void | Promise<void>;

    query(member: number, radius: number, count: number, excludeOwnTable: boolean, age?: number): Promise<QueryResult>;
    locationOf(member: number): Promise<Location | undefined>;

    putLocation(location: PutLocation): Promise<void>;
}
