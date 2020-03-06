import { DataSource } from 'apollo-datasource';
import { getOperationAST, parse, subscribe, validate } from 'graphql';
import { getAsyncIterator, isAsyncIterable } from 'iterall';
import { keys } from 'lodash';
import { OperationMessage } from 'subscriptions-transport-ws';
import { logger } from '../../lambda/publishToActiveSubscriptions';
import { ClientLostError } from '../types/ClientLostError';
import { findAndAuthorizeConnetion } from './findAndAuthorizeConnetion';
import { ProtocolContext } from './ProtocolContext';

// tslint:disable-next-line: max-func-body-length
export async function gqlOperation<TConnection = any, TResolver extends { dataSources: DataSource<any>[] } = any>(
    context: ProtocolContext<TConnection, TResolver>,
    operation: OperationMessage,
) {
    const connection = await findAndAuthorizeConnetion(context);
    if (!connection) { return; }

    if (!operation.payload || !operation.payload.query) {
        throw new Error('Protocol error: payload and/or query is null');
    }

    const { connectionManager, subscriptionManager, createContext } = context.serverContext;

    context.logger.log('gqlOperation', operation.payload);
    const { query, variables, operationName } = operation.payload;
    const graphqlDocument = parse(query as string);
    const operationAST = getOperationAST(graphqlDocument, operationName || '');

    if (!operationAST || operationAST.operation !== 'subscription') {
        context.logger.error('Only subscriptions are supported', operation);
        await connectionManager.sendError(context.connectionId, operation.id, { message: 'Only subscriptions are supported' });

        return;
    }

    const validationErrors = validate(context.serverContext.schema, graphqlDocument);
    if (validationErrors.length > 0) {
        context.logger.error('gqlOperation validation failed', validationErrors);
        await connectionManager.sendError(context.connectionId, operation.id, { errors: validationErrors });

        return;
    }

    try {
        const aCtx = await createContext({
            eventId: context.lambdaContext.awsRequestId,
            connectionId: connection.connectionId,
            principal: connection.principal,
            context: connection.context,
        });

        keys(aCtx.dataSources).forEach((k) => {
            // @ts-ignore
            const ds: DataSource<IApolloContext> = aCtx.dataSources[k];

            if (ds.initialize) {
                ds.initialize({
                    context: aCtx,
                    cache: context.serverContext.cache,
                });
            }
        });

        const iterable = await subscribe({
            operationName,
            schema: context.serverContext.schema,
            document: graphqlDocument,
            rootValue: operation,
            variableValues: variables,
            contextValue: aCtx,
        });

        await context.serverContext.subscriptionCreated(aCtx);

        if (!isAsyncIterable(iterable)) {
            logger.debug('Not iteratbale', iterable);

            await connectionManager.sendError(
                context.connectionId, operation.id, iterable,
            );

            if (operation.id) {
                // we have no information about the subscription here
                await subscriptionManager.unsubscribe(connection.connectionId, operation.id);
            }
        } else {
            // we need to have the iterator wait first
            const iterator = getAsyncIterator(iterable);
            iterator.next();
        }
    } catch (err) {
        if (!(err instanceof ClientLostError)) {
            context.logger.error(err);
            await connectionManager.sendError(context.connectionId, operation.id, err);
        }
    }
}
