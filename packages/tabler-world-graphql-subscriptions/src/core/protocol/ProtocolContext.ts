import { ConsoleLogger, ILogger } from '@mskg/tabler-world-common';
import { Context } from 'aws-lambda';
import { APIGatewayWebSocketEvent } from 'aws-lambda-graphql';
import { SubscriptionServerContext } from '../../server/SubscriptionServerContext';
import { Routes } from './Routes';

export class ProtocolContext<TConnectionContext = any, TResolverContext = any> {
    public readonly body: string | null | undefined;
    public readonly route: Routes;
    public readonly connectionId: string;
    public readonly logger: ILogger;

    constructor(
        public readonly serverContext: SubscriptionServerContext<TConnectionContext, TResolverContext>,
        public readonly lambdaContext: Context,
        private event: APIGatewayWebSocketEvent,
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
