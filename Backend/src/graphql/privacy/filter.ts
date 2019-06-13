import { calculateLevel } from "./calculateLevel";
import { FilterContext } from "./FilterContext";
import { AnyType, WhiteList } from "./WhiteList";

export function filter(context: FilterContext, member: AnyType): AnyType {
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
