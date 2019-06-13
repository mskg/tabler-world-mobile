import { onError } from "apollo-link-error";
import { logger } from './logger';

export const errorLink = onError(({ networkError, graphQLErrors, response, operation }) => {
    logger.log("Response", response, "Operation", operation);

    if (networkError) {
      logger.error(networkError);

      // var se = networkError as ServerError;

      // if (se.statusCode === 401) {
      //   getReduxStore().dispatch(logoutUser());
      //   return;
      // }
    }

    if (graphQLErrors) logger.error(graphQLErrors);
  });