import { Categories, Logger } from '../helper/Logger';

const logger = new Logger(Categories.SagaRoot);

type ReturnType<T> = {
    result?: T,
    error?: any,
};

export function* safe<T = any>(effect): Generator<ReturnType<T>> {
    try {
        return { result: yield effect };
    } catch (error) {
        logger.error('saga:safe', error);
        return { error };
    }
}
