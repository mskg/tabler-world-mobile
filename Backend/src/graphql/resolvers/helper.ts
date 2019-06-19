import { IApolloContext } from "../types/IApolloContext";
import { MemberReader } from "./MemberReader";
import { StructureReader } from "./StructureReader";

const STRUCTURE = "structure";
const MEMBER = "member";

export function getStructureReader(context: IApolloContext): StructureReader {
    let res = context.requestCache[STRUCTURE];
    if (res == null) {
        res = new StructureReader(context.logger, context);
        context.requestCache[STRUCTURE] = res;
    }

    return res;
}

export function getMemberReader(context: IApolloContext): MemberReader {
    let res = context.requestCache[MEMBER];
    if (res == null) {
        res = new MemberReader(context);
        context.requestCache[MEMBER] = res;
    }

    return res;
}
