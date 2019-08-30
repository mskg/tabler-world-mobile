import { createMigrate } from 'redux-persist';
import { Categories, Logger } from '../helper/Logger';

const logger = new Logger(Categories.Redux);

// if you want to wipe the store just increment the number here
export const MIGRATE_VERSION = 49;

//@ts-ignore
export const migrateToNull = createMigrate({
  [MIGRATE_VERSION]: ({_persist, ...props}) => {
    logger.log("Running migration, previous", _persist);

    return {
      _persist
    };
  },
}, { debug: __DEV__ });
