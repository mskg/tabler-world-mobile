import { DataSourceConfig } from 'apollo-datasource';
import { IApolloContext } from '../types/IApolloContext';

export type QueryResult = {
    member: number,
    lastseen: Date,

    speed: number,
    accuracy: number,

    address: any,

    position: Location,
    distance: number,
}[];

export type PutLocation = {
    longitude: number;
    latitude: number;
    member: number;
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

    query(member: number, radius: number, count: number, age?: number): Promise<QueryResult>;
    locationOf(member: number): Promise<Location | undefined>;

    putLocation(location: PutLocation): Promise<void>;
}
