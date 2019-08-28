import { createMigrate } from 'redux-persist';
import { INITIAL_STATE } from './initialState';

export const MIGRATE_VERSION = 34;

// const NULL = (state) => {
//   console.warn('Migration running to version', MIGRATE_VERSION);
//   return undefined;
// };

export const migrateToNull = (state: keyof typeof INITIAL_STATE) => createMigrate({
  [MIGRATE_VERSION - 1]: () => INITIAL_STATE[state],
}, { debug: __DEV__ });
