import { AlbumsAPI } from "./Albums";
import { MembersDataSource } from "./Members";
import { StructureDataSource } from "./Structure";

export const dataSources = (): IDataSources => {
    return {
        members: new MembersDataSource(),
        albums: new AlbumsAPI(),
        structure: new StructureDataSource(),
    };
};

export interface IDataSources {
    members: MembersDataSource,
    albums: AlbumsAPI,
    structure: StructureDataSource,
}