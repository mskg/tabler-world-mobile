import { lookupPrincipal, validateToken } from '@mskg/tabler-world-auth-client';
import { ConsoleLogger, ILogger } from '@mskg/tabler-world-common';
import { withClient } from '@mskg/tabler-world-rds-client';
import { APIGatewayProxyResult, Context } from 'aws-lambda';
import { APIGatewayWebSocketEvent } from 'aws-lambda-graphql';
import { getOperationAST, parse, subscribe, validate } from 'graphql';
import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { cacheInstance } from './cache/cacheInstance';
import { dataSources } from './dataSources';
import { executableSchema } from './executableSchema';
import { connectionManager, subscriptionManager } from './subscriptions';
import { ISubscriptionContext } from './types/ISubscriptionContext';

const SUCCESS = { statusCode: 200, body: '' };

enum Routes {
    connect = '$connect',
    disconnect = '$disconnect',
    default = '$default',
}

// tslint:disable: export-name
// tslint:disable: max-func-body-length
export async function handler(event: APIGatewayWebSocketEvent, context: Context): Promise<APIGatewayProxyResult> {
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

        const logger: ILogger = new ConsoleLogger(route, connectionId);
        logger.log('event');

        if (route === Routes.connect) {
            await connectionManager.connect(connectionId);
            return SUCCESS;
        } if (route === Routes.disconnect) {
            await Promise.all([
                subscriptionManager.unsubscribeAll(connectionId),
                connectionManager.disconnect(connectionId),
            ]);

            return SUCCESS;
        } {
            if (!event.body) {
                return SUCCESS;
            }

            const operation = JSON.parse(event.body) as OperationMessage;
            logger.log(operation.type);

            if (operation.type === MessageTypes.GQL_CONNECTION_INIT) {
                const { Authorization: token } = operation.payload || {};

                try {
                    logger.log('Validating Authorization', token);

                    if (!token) {
                        console.log('No token provided');
                        throw new Error('Unauthorized (token)');
                    }

                    const { email } = await validateToken(
                        process.env.AWS_REGION as string,
                        process.env.UserPoolId as string,
                        token);

                    logger.log('Found', email);

                    const principal = await withClient(context, (client) => lookupPrincipal(client, email));
                    logger.log('resolved', principal);
                    await connectionManager.authorize(connectionId, principal);

                    logger.log('authorized');
                    await connectionManager.sendACK(connectionId);
                } catch (e) {
                    logger.error('Failed to authenticate connection', e);

                    if (!(e instanceof ClientLostError)) {
                        await connectionManager.sendError(
                            connectionId,
                            { message: e.message },
                            MessageTypes.GQL_CONNECTION_ERROR,
                        );

                        await connectionManager.forceDisconnect(connectionId);
                    }
                }

                return SUCCESS;
            }

            if (operation.type === MessageTypes.GQL_STOP) {
                logger.log(operation);
                await subscriptionManager.unsubscribe(connectionId, operation.id as string);
                return SUCCESS;
            }

            const details = await connectionManager.get(connectionId);
            if (!details || !details.principal) {
                logger.error('Unkown client', connectionId);

                await connectionManager.sendError(
                    connectionId,
                    { message: 'Unknown client' },
                    MessageTypes.GQL_ERROR, // GQL_CONNECTION_ERROR ?
                );

                await connectionManager.forceDisconnect(connectionId);
                return SUCCESS;
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
                        cache: cacheInstance,
                        dataSources: dataSources(),
                        requestCache: {},
                        connectionId: details.connectionId,
                        principal: details.principal,
                        logger: new ConsoleLogger(event, connectionId, details.principal.id),
                    } as ISubscriptionContext,
                });

            } catch (err) {
                if (!(err instanceof ClientLostError)) {
                    logger.error(err);
                    await connectionManager.sendError(connectionId, err);
                }
            }

            return SUCCESS;
        }
    } catch (e) {
        console.error('Faild websocket event', e, event);

        if (!(e instanceof ClientLostError)) {
            throw e;
        }
    }
}
