import { GeocoderDataSource } from "./GeocoderDataSource";
import { MembersDataSource } from "./MembersDataSource";
import { StructureDataSource } from "./StructureDataSource";
import { TablerWorldAPI } from "./TablerWorldAPI";

export const dataSources = (): IDataSources => {
    return {
        members: new MembersDataSource(),
        tablerWorld: new TablerWorldAPI(),
        structure: new StructureDataSource(),
        geocoder: new GeocoderDataSource(),
    };
};

export interface IDataSources {
    members: MembersDataSource;
    tablerWorld: TablerWorldAPI;
    structure: StructureDataSource;
    geocoder: GeocoderDataSource;
}
