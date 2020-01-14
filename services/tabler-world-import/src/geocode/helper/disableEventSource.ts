import { xAWS } from '@mskg/tabler-world-aws';
import { getEventSourceMapping } from './getEventSourceMapping';

const lambda = new xAWS.Lambda();

/**
 * Disables (the only) lambda event source
 */
export const disableEventSource = async () => {
    const eventSourceMapping = await getEventSourceMapping();
    if (eventSourceMapping.UUID == null) {
        throw new Error('Failed to retrieve eventSourceMapping');
    }

    await lambda.updateEventSourceMapping({
        UUID: eventSourceMapping.UUID,
        FunctionName: process.env.AWS_LAMBDA_FUNCTION_NAME,
        Enabled: false,
    }).promise();
};
