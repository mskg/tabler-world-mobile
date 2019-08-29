import { gql } from "apollo-server-core";
import { Albums } from "./Albums";
import { Geo } from "./Geo";
import { Jobs } from "./Jobs";
import { Member } from "./Member";
import { Mutation } from "./Mutation";
import { News } from "./News";
import { Parameters } from "./Parameters";
import { Query } from "./Query";
import { SearchMember } from "./Search";
import { Settings } from "./Settings";
import { Structure } from "./Structure";

export const schema = [
    gql`
        scalar Date
    `,
    Query,
    Member,
    Structure,
    // SyncMember,
    SearchMember,
    Mutation,
    Settings,
    Jobs,
    Albums,
    // Documents,
    News,
    Geo,
    Parameters,
];