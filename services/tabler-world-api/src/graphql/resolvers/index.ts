import { merge } from 'lodash';
import { AddressResolver } from './Address';
import { AlbumsResolver } from './Albums';
import { ChatResolver } from './Chat';
import { JobsResolver } from './Jobs';
import { LocationResolver } from './Location';
import { MemberResolver } from './Member';
import { NewsResolver } from './News';
import { ParametersResolver } from './Parameters';
import { RolesResolver } from './Roles';
import { SearchDirectoryResolver } from './SearchDirectory';
import { SearchMemberResolver } from './SearchMember';
import { SettingsResolver } from './Settings';
import { StructureResolver } from './Structure';
import { TokenResolver } from './Token';
import { UserResolver } from './User';
import { UserRolesResolver } from './UserRoles';

// tslint:disable: export-name
// tslint:disable: variable-name
export const resolvers = merge(
    UserResolver,
    MemberResolver,
    StructureResolver,
    RolesResolver,
    SearchMemberResolver,
    SearchDirectoryResolver,
    TokenResolver,
    SettingsResolver,
    AddressResolver,
    JobsResolver,
    AlbumsResolver,
    NewsResolver,
    LocationResolver,
    ParametersResolver,
    UserRolesResolver,
    ChatResolver,
    // DocumentsResolver,
);
