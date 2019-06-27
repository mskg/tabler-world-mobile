import { IPrincipal } from "../types/IPrincipal";
import { calculateLevel } from "./calculateLevel";
import { AnyType, WhiteList } from "./WhiteList";

export function filter(context: IPrincipal, member: AnyType): AnyType {
    const level = calculateLevel(context, member);
    const fields: string[] = [];

    WhiteList.forEach(f => fields.push(...f(level, member)));
    const newTabler: AnyType = {};

    fields.forEach(f => {
        if (member[f] != null) {
            const val = member[f];
            if (val != null && val != "") {
                newTabler[f] = val;
            }
        }
    });
    return newTabler;
}
