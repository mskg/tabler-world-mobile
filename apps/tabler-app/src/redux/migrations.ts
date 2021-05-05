import { createMigrate } from 'redux-persist';
import { Categories, Logger } from '../helper/Logger';

const logger = new Logger(Categories.Redux);

// if you want to wipe the store just increment the number here
export const MIGRATE_VERSION = 52;

export const migrateToNull = createMigrate(
    {
        [MIGRATE_VERSION]: ({ _persist }) => {
            logger.log('Running migration, previous', _persist);

            return {
                _persist,
            };
        },
    },
    { debug: __DEV__ },
);
