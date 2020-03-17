import { ConsoleLogger } from '@mskg/tabler-world-common';
import { IPrincipal } from '../types/IPrincipal';
import { calculateLevel } from './calculateLevel';
import { AnyType, WhiteList } from './WhiteList';

const DEBUG = false;

const logger = new ConsoleLogger('filter');

export function filter(context: IPrincipal, member: AnyType): AnyType {
    const level = calculateLevel(context, member);
    if (DEBUG) { logger.debug('Principal', context, 'Member', member, 'Level', level); }

    const result: AnyType = {};
    for (const whiteListFunc of WhiteList) {
        for (const field of whiteListFunc(level, member)) {
            const val = member[field];
            if (DEBUG) { logger.debug('Field', field, val); }

            if (val != null && val !== '') {
                result[field] = val;
            }
        }
    }

    return result;
}
