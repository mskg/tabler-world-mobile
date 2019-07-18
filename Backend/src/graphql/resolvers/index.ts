import { merge } from "lodash";
import { AddressResolver } from "./Address";
import { AlbumsResolver } from "./Albums";
import { JobsResolver } from "./Jobs";
import { MemberResolver } from "./Member";
import { NewsResolver } from "./News";
import { RolesResolver } from "./Roles";
import { SearchMemberResolver } from "./Search";
import { SettingsResolver } from "./Settings";
import { StructureResolver } from "./Structure";
import { TokenResolver } from "./Token";
import { UserResolver } from "./User";

export const resolvers = merge(
    UserResolver,
    MemberResolver,
    StructureResolver,
    RolesResolver,
    SearchMemberResolver,
    TokenResolver,
    SettingsResolver,
    AddressResolver,
    JobsResolver,
    AlbumsResolver,
    NewsResolver,
    // DocumentsResolver,
);