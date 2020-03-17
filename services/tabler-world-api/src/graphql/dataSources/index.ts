import { DataSource, DataSourceConfig } from 'apollo-datasource';
import { Environment } from '../Environment';
import { CombinedLocationStore } from '../location/CombinedLocationStore';
import { RedisLocationStorage } from '../location/RedisLocationStorage';
import { SqlLocationStorage } from '../location/SqlLocationStorage';
import { IApolloContext } from '../types/IApolloContext';
import { ConversationsDataSource } from './ConversationsDataSource';
import { GeocoderDataSource } from './GeocoderDataSource';
import { LocationDataSource } from './LocationDataSource';
import { MembersDataSource } from './MembersDataSource';
import { StructureDataSource } from './StructureDataSource';
import { TablerWorldAPI } from './TablerWorldAPI';

// tslint:disable: max-classes-per-file


/**
 * We capture the init cycle and configuration
 */
class InitCapture extends DataSource<IApolloContext> {
    public config?: DataSourceConfig<IApolloContext>;

    public initialize(config: DataSourceConfig<IApolloContext>) {
        this.config = config;
    }
}

/**
 * We defer the init until first usage to save resources
 */
class DeferedDataSources {
    locationInitHook = new InitCapture();
    locationDataSource?: LocationDataSource;
    get location() {
        if (!this.locationInitHook.config) {
            return this.locationInitHook;
        }

        if (!this.locationDataSource) {
            if (Environment.Caching.useRedis) {
                // we always write to both
                this.locationDataSource = new LocationDataSource(
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
                this.locationDataSource = new LocationDataSource(
                    new SqlLocationStorage(),
                );
            }

            this.locationDataSource.initialize(this.locationInitHook.config);
        }

        return this.locationDataSource;
    }

    apiInitHook = new InitCapture();
    apiDataSource?: TablerWorldAPI;
    get tablerWorld() {
        if (!this.apiInitHook.config) {
            return this.apiInitHook;
        }

        if (!this.apiDataSource) {
            this.apiDataSource = new TablerWorldAPI();
            this.apiDataSource.initialize(this.apiInitHook.config);
        }

        return this.apiDataSource;
    }

    membersInitHook = new InitCapture();
    membersDataSource?: MembersDataSource;
    get members() {
        if (!this.membersInitHook.config) {
            return this.membersInitHook;
        }

        if (!this.membersDataSource) {
            this.membersDataSource = new MembersDataSource();
            this.membersDataSource.initialize(this.membersInitHook.config);
        }

        return this.membersDataSource;
    }

    structureInitHook = new InitCapture();
    structureDataSource?: StructureDataSource;
    get structure() {
        if (!this.structureInitHook.config) {
            return this.structureInitHook;
        }

        if (!this.structureDataSource) {
            this.structureDataSource = new StructureDataSource();
            this.structureDataSource.initialize(this.structureInitHook.config);
        }

        return this.structureDataSource;
    }

    geocoderInitHook = new InitCapture();
    geocoderDataSource?: GeocoderDataSource;
    get geocoder() {
        if (!this.geocoderInitHook.config) {
            return this.geocoderInitHook;
        }

        if (!this.geocoderDataSource) {
            this.geocoderDataSource = new GeocoderDataSource();
            this.geocoderDataSource.initialize(this.geocoderInitHook.config);
        }

        return this.geocoderDataSource;
    }

    conversationInitHook = new InitCapture();
    conversationDataSource?: ConversationsDataSource;
    get conversations() {
        if (!this.conversationInitHook.config) {
            return this.conversationInitHook;
        }

        if (!this.conversationDataSource) {
            this.conversationDataSource = new ConversationsDataSource();
            this.conversationDataSource.initialize(this.conversationInitHook.config);
        }

        return this.conversationDataSource;
    }
}

const defered = new DeferedDataSources();
export const dataSources = (): IDataSources => {
    //  @ts-ignore
    return defered;
};

export interface IDataSources {
    members: MembersDataSource;
    tablerWorld: TablerWorldAPI;
    structure: StructureDataSource;
    geocoder: GeocoderDataSource;
    conversations: ConversationsDataSource;
    location: LocationDataSource;
}
