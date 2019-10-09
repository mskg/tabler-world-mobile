import { onError } from 'apollo-link-error';
import { DocumentNode } from 'graphql';
import { logger } from './logger';

function getGqlString(doc: DocumentNode) {
    return doc.loc && doc.loc.source.body;
}

export const errorLink = onError(({ networkError, graphQLErrors, response, operation }) => {
    const { operationName, query, variables } = operation;

    logger.log(
        'Failed to execute operation', operationName,
        'query', getGqlString(query),
        'variables', variables,
        'Response', response,
    );

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
