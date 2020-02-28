import { Audit, ConsoleLogger, Metric } from '@mskg/tabler-world-common';
import { DataSource } from 'apollo-datasource';
import { getOperationAST, parse, subscribe, validate } from 'graphql';
import { getAsyncIterator, isAsyncIterable } from 'iterall';
import { keys } from 'lodash';
import { OperationMessage } from 'subscriptions-transport-ws';
import { cacheInstance } from '../../cache/cacheInstance';
import { dataSources } from '../../dataSources';
import { executableSchema } from '../../executableSchema';
import { createLimiter } from '../../ratelimit/createLimiter';
import { IApolloContext } from '../../types/IApolloContext';
import { ISubscriptionContext } from '../../types/ISubscriptionContext';
import { logger } from '../publishToActiveSubscriptions';
import { connectionManager, subscriptionManager } from '../services';
import { ClientLostError } from '../types/ClientLostError';
import { findAndAuthorizeConnetion } from './findAndAuthorizeConnetion';
import { ProtocolContext } from './ProtocolContext';

export async function gqlOperation(context: ProtocolContext, operation: OperationMessage) {
    const connection = await findAndAuthorizeConnetion(context);
    if (!connection) { return; }

    if (!operation.payload || !operation.payload.query) {
        throw new Error('Protocol error: payload and/or query is null');
    }

    context.logger.log('gqlOperation', operation.payload);
    const { query, variables, operationName } = operation.payload;
    const graphqlDocument = parse(query as string);
    const operationAST = getOperationAST(graphqlDocument, operationName || '');

    if (!operationAST || operationAST.operation !== 'subscription') {
        context.logger.error('Only subscriptions are supported', operation);
        await connectionManager.sendError(context.connectionId, operation.id, { message: 'Only subscriptions are supported' });

        return;
    }

    const validationErrors = validate(executableSchema, graphqlDocument);
    if (validationErrors.length > 0) {
        context.logger.error('gqlOperation validation failed', validationErrors);
        await connectionManager.sendError(context.connectionId, operation.id, { errors: validationErrors });

        return;
    }

    try {
        const aCtx = {
            clientInfo: {
                version: connection.context.version,
                os: connection.context.os,
            },
            cache: cacheInstance,
            dataSources: dataSources(),
            requestCache: {},
            connectionId: context.connectionId,
            principal: connection.principal,
            logger: new ConsoleLogger(context.route, context.connectionId, connection.principal.id),
            getLimiter: createLimiter,
            auditor: new Audit(context.lambdaContext.awsRequestId, `${connection.principal.email}:${connection.principal.id}`),
            metrics: new Metric(),
        } as ISubscriptionContext;

        keys(aCtx.dataSources).forEach((k) => {
            // @ts-ignore
            const ds: DataSource<IApolloContext> = aCtx.dataSources[k];

            if (ds.initialize) {
                ds.initialize({
                    context: aCtx,
                    cache: cacheInstance,
                });
            }
        });

        const iterable = await subscribe({
            operationName,
            schema: executableSchema,
            document: graphqlDocument,
            rootValue: operation,
            variableValues: variables,
            contextValue: aCtx,
        });

        aCtx.auditor.dump();
        aCtx.metrics.dump();

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
