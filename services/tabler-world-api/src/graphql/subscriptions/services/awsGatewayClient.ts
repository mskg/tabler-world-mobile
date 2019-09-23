import { EXECUTING_OFFLINE, xAWS } from '@mskg/tabler-world-aws';

export const awsGatewayClient = new xAWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',

    endpoint: EXECUTING_OFFLINE
        ? 'http://localhost:3001'
        : process.env.PUBLISH_ENDPOINT,
});
