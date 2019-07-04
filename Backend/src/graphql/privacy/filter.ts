import { IPrincipal } from "../types/IPrincipal";
import { calculateLevel } from "./calculateLevel";
import { AnyType, WhiteList } from "./WhiteList";

export function filter(context: IPrincipal, member: AnyType): AnyType {
    const level = calculateLevel(context, member);

    return WhiteList.reduce((result, whiteList) => {
        whiteList(level, member).forEach(field => {
            const val = member[field];

            if (val != null && val !== "") {
                result[field] = val;
            }
        })

        return result;
    }, {} as AnyType);
}
