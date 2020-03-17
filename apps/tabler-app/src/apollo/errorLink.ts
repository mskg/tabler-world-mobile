import { onError } from 'apollo-link-error';
import { ServerError, ServerParseError } from 'apollo-link-http-common';
import { DocumentNode, GraphQLError } from 'graphql';
import { logger } from './logger';

function getGqlString(doc: DocumentNode) {
    return doc.loc && doc.loc.source.body;
}

function limit(v?: string): string | undefined {
    if (!v) { return v; }
    if (v.length <= 100) { return v; }
    // tslint:disable-next-line: prefer-template
    return v.substr(0, 97) + '...';
}

function dumpResponse(response: Response, context: any) {
    if (!response) { return; }

    if (response.headers) {
        // @ts-ignore
        context.headers = response.headers.map || response.headers;
    }

    context.statusCode = response.status;
    context.statusText = response.statusText;
    context.url = response.url;
    context.type = response.type;
}

function findRequestId(networkError: any | undefined, graphQLErrors: readonly GraphQLError[] | undefined) {
    let requestId = networkError?.response?.headers?.get
        ? networkError.response.headers.get('x-amzn-requestid')
        : undefined;

    if (requestId) { return requestId; }
    if (graphQLErrors) {
        for (const error of graphQLErrors) {
            requestId = error.extensions?.requestId;
            if (requestId) { return requestId; }
        }
    }

    return undefined;
}

export const errorLink = onError(({ networkError, graphQLErrors, operation, response }) => {
    const { operationName, query, variables, extensions } = operation;

    const tags: Record<string, string> = {
        operationName,
    };

    const context: Record<string, any> = {
        operation: {
            variables,
            extensions,
            operationName,
            graphqlQuery: limit(getGqlString(query)),
        },
    };

    let rootMessage = `Operation '${operationName}' failed`;
    const requestId = findRequestId(networkError, graphQLErrors);

    if (requestId) {
        context.requestId = requestId;
        tags.requestId = requestId;

        // if we do this, the messages are unique and no longer grouped by sentry
        // rootMessage += ` (id: ${requestId})`;
    }

    // this is an error that does not serialize right
    if (networkError) {
        if (networkError.message === 'Network request failed') {
            rootMessage += ', endpoint unreachable.';
        } else {
            // Response failed to parse as JSON
            const spe = networkError as ServerParseError;
            if (spe.bodyText) {
                context.bodyText = limit(spe.bodyText);

                dumpResponse(spe.response, context);
                rootMessage += `, cannot parse content HTTP/${context.statusCode}`;
            }

            const se = networkError as ServerError;
            if (se.result) {
                context.statusCode = se.statusCode;

                dumpResponse(spe.response, context);
                rootMessage += `, with HTTP/${context.statusCode}`;
            }
        }

        if (context.statusCode) {
            tags.statusCode = context.statusCode;
        }
    }

    if (graphQLErrors) {
        context.graphQLErrors = graphQLErrors;
    }

    const component = operation.getContext()?.id;
    if (component) {
        rootMessage += ` (cmp: ${component})`;
    }

    const rootCause = new Error(rootMessage);
    if (networkError) {
        rootCause.stack = networkError.stack;
    }

    logger.error(
        component ?? 'GraphQL',
        rootCause,
        context,
        tags,
    );

    // if has no response arrived at all, we cannot change the response
    if (response) {
        // @ts-ignore
        response.errors = [{
            message: rootCause.message,
            stack: rootCause.stack,
            name: rootCause.name,
            originalError: rootCause,
            extensions: {
                logged: true,
            },
        }];
    }
});
