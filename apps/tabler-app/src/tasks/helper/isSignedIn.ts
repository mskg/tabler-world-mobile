import { getReduxStore } from '../../redux/getRedux';

export function isSignedIn(): boolean {
    const authState = getReduxStore()?.getState()?.auth?.state;
    return authState === 'singedIn';
}
