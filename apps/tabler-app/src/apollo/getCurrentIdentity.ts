import Auth from '@aws-amplify/auth';
import { logoutUser } from '../redux/actions/user';
import { getReduxStore } from '../redux/getRedux';
import { isAuthenticationError } from './isAuthenticationError';
import { logger } from './logger';

export async function getCurrentIdentity(): Promise<string> {
    try {
        const session = await Auth.currentSession();
        await Auth.currentCredentials();

        const token = session.getIdToken().getJwtToken();

        // logger.debug(session.getRefreshToken());
        logger.debug('Expiration', new Date(session.getIdToken().getExpiration() * 1000));

        return token;
    } catch (e) {
        if (isAuthenticationError(e)) {
            logger.log('Failed to acquire token', e);
            getReduxStore().dispatch(logoutUser());
        }

        throw e;
    }
}
