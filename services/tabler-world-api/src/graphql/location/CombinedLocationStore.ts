import { EXECUTING_OFFLINE } from '@mskg/tabler-world-aws';
import { DataSourceConfig } from 'apollo-datasource';
import { IApolloContext } from '../types/IApolloContext';
import { ILocationStorage, PutLocation } from './ILocationStorage';

export class CombinedLocationStore implements ILocationStorage {

    constructor(private store1: ILocationStorage, private store2: ILocationStorage) {
    }

    public initialize(config: DataSourceConfig<IApolloContext>) {
        if (this.store1.initialize) {
            this.store1.initialize(config);
        }

        if (this.store2.initialize) {
            this.store2.initialize(config);
        }
    }

    public async locationOf(member: number) {
        return await this.store1.locationOf(member)
            || (!EXECUTING_OFFLINE ? this.store2.locationOf(member) : undefined);
    }

    public async query(memberToMatch: number, radius: number, count: number, age?: number) {
        return await this.store1.query(memberToMatch, radius, count, age)
            || (!EXECUTING_OFFLINE ? this.store2.query(memberToMatch, radius, count, age) : undefined);
    }

    public async putLocation(loc: PutLocation) {
        await Promise.all([
            this.store1.putLocation(loc),
            this.store2.putLocation(loc),
        ]);
    }
}
