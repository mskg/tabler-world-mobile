import { EXECUTING_OFFLINE, xAWS } from '@mskg/tabler-world-aws';

const gatewayClient = new xAWS.ApiGatewayManagementApi({
    apiVersion: '2018-11-29',

    endpoint: EXECUTING_OFFLINE
        ? 'http://localhost:4001'
        : process.env.PUBLISH_ENDPOINT,
});

export default gatewayClient;
