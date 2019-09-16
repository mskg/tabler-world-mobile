import { getReduxStore } from '../../redux/getRedux';
import { MS_PER_MINUTE } from '../parameters/Timeouts';
import { logger } from './logger';
import { MaxTTL } from './MaxTTL';

/**
 * Returns truee of the timestamp of a result is valid against the TTL for a given type.
 * @returns true, if the application is offline or the record is valid.
 *
 */
export function isRecordValid(type: keyof typeof MaxTTL, val: number): boolean {
    if (getReduxStore().getState().connection.offline) {
        logger.debug('*** OFFLINE ***');
        return true;
    }

    const age = MaxTTL[type];
    const compareDate = Date.now() - age;

    if (val <= compareDate) {
        logger.debug(type, '*** REFETCHING DATA ***');
        return false;
    }

    logger.log(
        type,
        '*** IS VALID ***', 'age',
        age / MS_PER_MINUTE,
        'last fetch',
        new Date(val),
        'not older than',
        new Date(compareDate),
    );

    return true;
}
