import { IMember } from '../../model/IMember';
import { createAction } from './action';

// export const addDistrict = createAction<'@@filter/tabler/add', string>(
//   '@@filter/tabler/add'
// );

// export const removeDistrict = createAction<'@@filter/tabler/remove', string>(
//   '@@filter/tabler/remove'
// );

/**
 * Enable or disable a district global filter
 */
export const toggleDistrict = createAction<'@@filter/tabler/toggle', string>(
  '@@filter/tabler/toggle'
);

/**
 * Switch betwenn all/no records
 */
export const toggleAll = createAction<'@@filter/tabler/clear'>(
  '@@filter/tabler/clear'
);

/**
 * Enable/disable favorites
 */
export const toggleFavorites = createAction<'@@filter/tabler/favorites/toggle'>(
  '@@filter/tabler/favorites/toggle'
);

/**
 * Enable/disable a favorite
 */
export const toggleFavorite = createAction<'@@filter/tabler/favorite/toggle', IMember>(
  '@@filter/tabler/favorite/toggle'
);

/**
 * Enable/disable own table
 */
export const toggleOwnTable = createAction<'@@filter/tabler/ownTable/toggle'>(
  '@@filter/tabler/ownTable/toggle'
);

/**
 * Enable/disable a favorite
 */
export const replaceFavorites = createAction<'@@filter/tabler/favorites/replace', number[]>(
  '@@filter/tabler/favorites/replace'
);
