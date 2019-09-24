import { resolvePrincipal } from '@mskg/tabler-world-auth-client';
import { ILogger } from '@mskg/tabler-world-common';
import { APIGatewayProxyResult } from 'aws-lambda';
import { APIGatewayWebSocketEvent, WebSocketConnectEvent } from 'aws-lambda-graphql';
import { getOperationAST, parse, subscribe, validate } from 'graphql';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { executableSchema } from './executableSchema';
import { connectionManager } from './subscriptions/services';
import { WebSocketLogger } from './subscriptions/utils/WebSocketLogger';
import { ISubscriptionContext } from './types/ISubscriptionContext';

const SUCCESS = { statusCode: 200, body: '' };

enum Routes {
    connect = '$connect',
    disconnect = '$disconnect',
    default = '$default',
}

// tslint:disable-next-line: export-name
export async function handler(event: APIGatewayWebSocketEvent): Promise<APIGatewayProxyResult> {
    if (!(event.requestContext && event.requestContext.connectionId)) {
        console.error(
            'Invalid event',
            event,
        );

        throw new Error('Invalid event. Missing `connectionId` parameter.');
    }

    try {
        const route = event.requestContext.routeKey;
        const connectionId = event.requestContext.connectionId;

        const logger: ILogger = new WebSocketLogger(route, connectionId);
        logger.log('event');

        if (route === Routes.connect) {
            const principal = resolvePrincipal(event as WebSocketConnectEvent);
            logger.log('Constructing new context for principal', principal);

            await connectionManager.connect(connectionId, principal);
            return SUCCESS;
        } if (route === Routes.disconnect) {
            await connectionManager.disconnect(connectionId);
            return SUCCESS;
        } {
            if (!event.body) {
                return SUCCESS;
            }

            const operation = JSON.parse(event.body) as OperationMessage;

            if (operation.type === MessageTypes.GQL_CONNECTION_INIT) {
                // const payload = operation.payload || {};
                // checkAuthorization()

                await connectionManager.sendACK(connectionId);
                return SUCCESS;
            }

            if (operation.type === MessageTypes.GQL_STOP) {
                return SUCCESS;
            }

            const details = await connectionManager.get(connectionId);
            if (!details) {
                throw new Error('Unknown client');
            }

            if (!operation.payload || !operation.payload.query) {
                throw new Error('Protocol error: payload and/or query is null');
            }

            const { query, variables, operationName } = operation.payload;
            const graphqlDocument = parse(query as string);
            const operationAST = getOperationAST(graphqlDocument, operationName || '');

            if (!operationAST || operationAST.operation !== 'subscription') {
                logger.error('Only subscriptions are supported', operation);
                await connectionManager.sendError(connectionId, { message: 'Only subscriptions are supported' });
                return SUCCESS;
            }

            const validationErrors = validate(executableSchema, graphqlDocument);
            if (validationErrors.length > 0) {
                logger.error(validationErrors);
                await connectionManager.sendError(connectionId, { errors: validationErrors });
                return SUCCESS;
            }

            try {
                await subscribe({
                    operationName,
                    schema: executableSchema,
                    document: graphqlDocument,
                    rootValue: operation,
                    variableValues: variables,
                    contextValue: {
                        connectionId: details.connectionId,
                        principal: details.principal,
                        logger: new WebSocketLogger(event, connectionId, details.principal.id),
                    } as ISubscriptionContext,
                });

            } catch (err) {
                logger.error(err);
                await connectionManager.sendError(connectionId, err);
            }

            return SUCCESS;
        }
    } catch (e) {
        console.error('Faild websocket event', e, event);
        throw e;
    }
}
