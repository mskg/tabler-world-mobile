import { createMigrate } from 'redux-persist';
import { Categories, Logger } from '../helper/Logger';

const logger = new Logger(Categories.Redux);
export const MIGRATE_VERSION = 42;

//@ts-ignore
export const migrateToNull = createMigrate({
  [MIGRATE_VERSION - 1]: ({_persist}) => {
    logger.log("Running migration, previous", _persist);
    return {_persist};
  },
}, { debug: __DEV__ });
