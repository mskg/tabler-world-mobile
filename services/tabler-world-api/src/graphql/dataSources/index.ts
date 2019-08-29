import { GeocoderDataSource } from "./Geocoder";
import { MembersDataSource } from "./Members";
import { StructureDataSource } from "./Structure";
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
    members: MembersDataSource,
    tablerWorld: TablerWorldAPI,
    structure: StructureDataSource,
    geocoder: GeocoderDataSource,
}