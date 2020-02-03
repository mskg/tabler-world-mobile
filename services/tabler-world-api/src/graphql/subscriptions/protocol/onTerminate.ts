import { ProtocolContext } from './ProtocolContext';

export async function onTerminate(context: ProtocolContext) {
    context.logger.log('onTerminate');
}
