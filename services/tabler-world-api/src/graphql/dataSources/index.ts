import { ConversationsDataSource } from './ConversationsDataSource';
import { GeocoderDataSource } from './GeocoderDataSource';
import { LocationDataSource } from './LocationDataSource';
import { MembersDataSource } from './MembersDataSource';
import { StructureDataSource } from './StructureDataSource';
import { TablerWorldAPI } from './TablerWorldAPI';

export const dataSources = (): IDataSources => {
    return {
        members: new MembersDataSource(),
        tablerWorld: new TablerWorldAPI(),
        structure: new StructureDataSource(),
        geocoder: new GeocoderDataSource(),
        conversations: new ConversationsDataSource(),
        location: new LocationDataSource(),
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
