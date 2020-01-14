import { gql } from 'apollo-server-core';
import { Albums } from './Albums';
import { Auth } from './Auth';
import { Chat } from './Chat';
import { Deprecated } from './Deprecated';
import { Geo } from './Geo';
import { Jobs } from './Jobs';
import { Member } from './Member';
import { Mutation } from './Mutation';
import { News } from './News';
import { Parameters } from './Parameters';
import { Query } from './Query';
import { SearchMember } from './Search';
import { Settings } from './Settings';
import { Structure } from './Structure';

// tslint:disable-next-line: export-name
export const schema = [
    gql`
        scalar Date
    `,
    Auth,
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
    Chat,
    Deprecated,
];
