import { gql } from "apollo-server-core";
import { Jobs } from "./Jobs";
import { Member } from "./Member";
import { Mutation } from "./Mutation";
import { Query } from "./Query";
import { SearchMember } from "./Search";
import { Settings } from "./Settings";
import { Structure } from "./Structure";
import { SyncMember } from "./SyncMember";

export const schema = [
    gql`
        scalar Date
    `,
    Query,
    Member,
    Structure,
    SyncMember,
    SearchMember,
    Mutation,
    Settings,
    Jobs,
];