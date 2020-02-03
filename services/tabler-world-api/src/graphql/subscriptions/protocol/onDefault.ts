import { OperationMessage } from 'subscriptions-transport-ws';
import MessageTypes from 'subscriptions-transport-ws/dist/message-types';
import { gqlInit } from './gqlInit';
import { gqlOperation } from './gqlOperation';
import { gqlStop } from './gqlStop';
import { onTerminate } from './onTerminate';
import { ProtocolContext } from './ProtocolContext';

// tslint:disable-next-line: max-func-body-length
export async function onDefault(context: ProtocolContext) {
    context.logger.log('onDefault', context.body);

    if (!context.body) {
        context.logger.error('No body');
        return;
    }

    const operation = JSON.parse(context.body) as OperationMessage;
    context.logger.log(operation.type);

    if (operation.type === MessageTypes.GQL_CONNECTION_INIT) {
        await gqlInit(context, operation);
    } else if (operation.type === MessageTypes.GQL_STOP) {
        await gqlStop(context, operation);
    } else if (operation.type === MessageTypes.GQL_CONNECTION_TERMINATE) {
        await onTerminate(context);
    } else {
        await gqlOperation(context, operation);
    }
}
