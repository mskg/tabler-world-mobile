import { MembersDataSource } from "./Members";
import { StructureDataSource } from "./Structure";
import { TablerWorldAPI } from "./TablerWorldAPI";

export const dataSources = (): IDataSources => {
    return {
        members: new MembersDataSource(),
        tablerWorld: new TablerWorldAPI(),
        structure: new StructureDataSource(),
    };
};

export interface IDataSources {
    members: MembersDataSource,
    tablerWorld: TablerWorldAPI,
    structure: StructureDataSource,
}