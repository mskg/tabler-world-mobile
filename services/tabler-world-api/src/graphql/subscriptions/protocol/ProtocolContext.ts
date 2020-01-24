import { ConsoleLogger, ILogger } from '@mskg/tabler-world-common';
import { Context } from 'aws-lambda';
import { APIGatewayWebSocketEvent } from 'aws-lambda-graphql';
import { Routes } from './Routes';

export class ProtocolContext {
    public readonly body: string | null | undefined;
    public readonly route: Routes;
    public readonly connectionId: string;
    public readonly logger: ILogger;

    constructor(
        private event: APIGatewayWebSocketEvent,
        public lambdaContext: Context,
    ) {
        if (!(this.event.requestContext && this.event.requestContext.connectionId)) {
            throw new Error('Invalid event. Missing `connectionId` parameter.');
        }

        this.connectionId = this.event.requestContext.connectionId;
        this.route = this.event.requestContext.routeKey as Routes;
        this.body = this.event.body;

        this.logger = new ConsoleLogger(this.lambdaContext.awsRequestId, this.route, this.connectionId);
    }
}
