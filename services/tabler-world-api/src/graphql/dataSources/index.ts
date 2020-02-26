import { Environment } from '../Environment';
import { CombinedLocationStore } from '../location/CombinedLocationStore';
import { RedisLocationStorage } from '../location/RedisLocationStorage';
import { SqlLocationStorage } from '../location/SQLLocationStorage';
import { ConversationsDataSource } from './ConversationsDataSource';
import { GeocoderDataSource } from './GeocoderDataSource';
import { LocationDataSource } from './LocationDataSource';
import { MembersDataSource } from './MembersDataSource';
import { StructureDataSource } from './StructureDataSource';
import { TablerWorldAPI } from './TablerWorldAPI';

export const dataSources = (): IDataSources => {
    let location: LocationDataSource;

    if (Environment.Caching.useRedis) {
        // we always write to both
        location = new LocationDataSource(
            Environment.Location.useRedis
                // if we use redis, this goes first
                ? new CombinedLocationStore(
                    new RedisLocationStorage(),
                    new SqlLocationStorage(),
                )
                // db is first
                : new CombinedLocationStore(
                    new SqlLocationStorage(),
                    new RedisLocationStorage(),
                ),
        );
    } else {
        location = new LocationDataSource(
            new SqlLocationStorage(),
        );
    }

    return {
        location,
        members: new MembersDataSource(),
        tablerWorld: new TablerWorldAPI(),
        structure: new StructureDataSource(),
        geocoder: new GeocoderDataSource(),
        conversations: new ConversationsDataSource(),
    };
};

export interface IDataSources {
    members: MembersDataSource;
    tablerWorld: TablerWorldAPI;
    structure: StructureDataSource;
    geocoder: GeocoderDataSource;
    conversations: ConversationsDataSource;
    location: LocationDataSource;
}
