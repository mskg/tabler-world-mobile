import { getReduxStore } from '../../redux/getRedux';

export function isSignedIn(): boolean {
    try {
        const authState = getReduxStore()?.getState()?.auth?.state;
        return authState === 'singedIn';
    } catch {
        return false;
    }
}
