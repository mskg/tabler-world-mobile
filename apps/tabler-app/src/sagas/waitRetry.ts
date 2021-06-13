import { delay } from 'redux-saga/effects';
import { Categories, Logger } from '../helper/Logger';

const logger = new Logger(Categories.SagaRoot);


// tslint:disable-next-line: export-name
function* doWaitRetry(effect, initialDelay, ...args) {
    let tryCount = 0;
    let nextDelay = initialDelay;

    do {

        tryCount += 1;

        try {
            return yield effect(args);
        } catch (error) {
            logger.error('saga:waitretry', error, { try: tryCount, delay: nextDelay });
        }

        const nextDelayTime = nextDelay * tryCount * Math.random();

        logger.debug('delaying for', Math.round(nextDelayTime / 1000), '(s) try', tryCount);
        yield delay(nextDelayTime);

        nextDelay = nextDelay * tryCount * 2; // exponential backoff
        // tslint:disable-next-line: no-constant-condition
    } while (true);
}

export function waitRetry(generator) {
    return function* (...args) {
        return yield doWaitRetry(generator, 1000, ...args);
    }
}
