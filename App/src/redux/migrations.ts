import { createMigrate } from 'redux-persist';

export const MIGRATE_VERSION = 31;

const NULL = (state) => {
  console.warn('Migration running to version', MIGRATE_VERSION);
  return undefined;
};

const migrations = {
  19: NULL,
  20: NULL,
  21: NULL,
  22: NULL,
  23: NULL,
  24: NULL,
  25: NULL,
  26: NULL,
  27: NULL,
  28: NULL,
  29: NULL,
  30: NULL,
  MIGRATE_VERSION: NULL,
};

export const migrateToNull = createMigrate(migrations, { debug: false });
