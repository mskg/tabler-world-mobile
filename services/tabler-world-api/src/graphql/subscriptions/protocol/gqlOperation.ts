import { ConsoleLogger } from '@mskg/tabler-world-common';
import { getOperationAST, parse, subscribe, validate } from 'graphql';
import { OperationMessage } from 'subscriptions-transport-ws';
import { cacheInstance } from '../../cache/cacheInstance';
import { dataSources } from '../../dataSources';
import { executableSchema } from '../../executableSchema';
import { ISubscriptionContext } from '../../types/ISubscriptionContext';
import { connectionManager } from '../services';
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
        await connectionManager.sendError(context.connectionId, { message: 'Only subscriptions are supported' });

        return;
    }

    const validationErrors = validate(executableSchema, graphqlDocument);
    if (validationErrors.length > 0) {
        context.logger.error('gqlOperation validation failed', validationErrors);
        await connectionManager.sendError(context.connectionId, { errors: validationErrors });

        return;
    }

    try {
        await subscribe({
            operationName,
            schema: executableSchema,
            document: graphqlDocument,
            rootValue: operation,
            variableValues: variables,
            contextValue: {
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
            } as ISubscriptionContext,
        });
    } catch (err) {
        if (!(err instanceof ClientLostError)) {
            context.logger.error(err);
            await connectionManager.sendError(context.connectionId, err);
        }
    }
}
