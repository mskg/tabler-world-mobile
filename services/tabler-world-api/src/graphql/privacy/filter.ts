import { IPrincipal } from '../types/IPrincipal';
import { calculateLevel } from './calculateLevel';
import { AnyType, WhiteList } from './WhiteList';

const DEBUG = false;

export function filter(context: IPrincipal, member: AnyType): AnyType {
    const level = calculateLevel(context, member);
    if (DEBUG) { console.log('Principal', context, 'Member', member, 'Level', level); }

    const result: AnyType = {};
    for (const whiteListFunc of WhiteList) {
        for (const field of whiteListFunc(level, member)) {
            const val = member[field];
            if (DEBUG) { console.log('Field', field, val); }

            if (val != null && val !== '') {
                result[field] = val;
            }
        }
    }

    return result;
}
