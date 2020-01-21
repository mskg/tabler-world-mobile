import { createAction } from './action';

/**
 * Add a history entry
 */
export const addTablerSearch = createAction<'@@history/tabler/search/add', string>(
  '@@history/tabler/search/add',
);

/**
 * Add a history entry
 */
export const addStructureSearch = createAction<'@@history/structure/search/add', string>(
    '@@history/structure/search/add',
  );

/**
 * Add history entry
 */
export const addTablerLRU = createAction<'@@history/tabler/lru/add', number>(
  '@@history/tabler/lru/add',
);
