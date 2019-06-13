import { IApolloContext } from "../types/IApolloContext";
import { MemberReader } from "./MemberReader";
import { StructureReader } from "./StructureReader";

const STRUCTURE = "structure";
const MEMBER = "member";

export function getStructureReader(context: IApolloContext): StructureReader {
    let res = context.cache[STRUCTURE];
    if (res == null) {
        res = new StructureReader(context.logger);
        context.cache[STRUCTURE] = res;
    }

    return res;
}

export function getMemberReader(context: IApolloContext): MemberReader {
    let res = context.cache[MEMBER];
    if (res == null) {
        res = new MemberReader(context);
        context.cache[MEMBER] = res;
    }

    return res;
}
