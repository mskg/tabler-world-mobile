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
    '@@filter/tabler/toggle',
);

/**
 * Switch betwenn all/no records
 */
export const toggleAll = createAction<'@@filter/tabler/clear'>(
    '@@filter/tabler/clear',
);

/**
 * Enable/disable favorites
 */
export const toggleFavorites = createAction<'@@filter/tabler/favorites/toggle'>(
    '@@filter/tabler/favorites/toggle',
);

/**
 * Enable/disable a favorite
 */
export const toggleFavorite = createAction<'@@filter/tabler/favorite/toggle', { id: number }>(
    '@@filter/tabler/favorite/toggle',
);

export const addFavorite = createAction<'@@filter/tabler/favorite/add', { id: number }>(
    '@@filter/tabler/favorite/add',
);

export const removeFavorite = createAction<'@@filter/tabler/favorite/remove', { id: number }>(
    '@@filter/tabler/favorite/remove',
);

/**
 * Enable/disable own table
 */
export const toggleOwnTable = createAction<'@@filter/tabler/ownTable/toggle'>(
    '@@filter/tabler/ownTable/toggle',
);

/**
 * Enable/disable a favorite
 */
export const replaceFavorites = createAction<'@@filter/tabler/favorites/replace', number[]>(
    '@@filter/tabler/favorites/replace',
);

/**
 * Enable/disable own association board
 */
export const toggleAssociationBoard = createAction<'@@filter/tabler/associationBoard/toggle'>(
    '@@filter/tabler/associationBoard/toggle',
);

/**
 * Enable/disable own area board
 */
export const toggleAreaBoard = createAction<'@@filter/tabler/areaBoard/toggle'>(
    '@@filter/tabler/areaBoard/toggle',
);


/**
 * Clubs favorites
 */

export const toggleFavoriteClub = createAction<'@@filter/club/favorite/toggle', { id: number }>(
    '@@filter/club/favorite/toggle',
);

export const addFavoriteClub = createAction<'@@filter/club/favorite/add', { id: number }>(
    '@@filter/club/favorite/add',
);

export const removeFavoriteClub = createAction<'@@filter/club/favorite/remove', { id: number }>(
    '@@filter/club/favorite/remove',
);

export const replaceFavoriteClubs = createAction<'@@filter/club/favorites/replace', number[]>(
    '@@filter/club/favorites/replace',
);