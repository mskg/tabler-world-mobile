import { IWhoAmI } from '../../model/IWhoAmI';
import { createAction } from './action';

/**
 * Replace user state
 */
export const replaceUser = createAction<'@@user/replace', IWhoAmI>(
  '@@user/replace'
);

/**
 * Authentication state signIn
 * signIn = loggedOut -> confirmSignIn -> ...
 */
export const signin = createAction<'@@user/auth/signin'>(
  '@@user/auth/signin'
);

/**
 * Authentication state singedIn
 * signIn = loggedOut -> confirmSignIn -> ...
 */
export const singedIn = createAction<'@@user/auth/singedIn'>(
  '@@user/auth/singedIn'
);

/**
 * Authentication state confirmSignIn
 * signIn = loggedOut -> confirmSignIn -> ...
 */
export const confirmSignIn = createAction<'@@user/auth/confirmSignIn', {username: string, state: any}>(
  '@@user/auth/confirmSignIn'
);

/**
 * Wipe authentication and data
 */
export const logoutUser = createAction<'@@user/auth/logout'>(
  '@@user/auth/logout'
);

