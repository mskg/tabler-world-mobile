import { onError } from 'apollo-link-error';
import { logger } from './logger';

export const errorLink = onError(({ networkError, graphQLErrors, response, operation }) => {
    logger.log('Response', response, 'Operation', operation);

    if (networkError) {
        logger.error(networkError);

        // getReduxStore().dispatch(
        //   addErrorSnack(networkError)
        // );
    }

    if (graphQLErrors) {
        graphQLErrors.forEach((e) => {
            // addErrorSnack(errorLink);
            logger.error(e);
        });
    }
});
