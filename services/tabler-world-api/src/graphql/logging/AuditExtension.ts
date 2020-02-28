import { GraphQLResponse } from 'apollo-server-core';
import { GraphQLExtension } from 'apollo-server-lambda';
import { IApolloContext } from '../types/IApolloContext';

export class AuditExtension extends GraphQLExtension<IApolloContext> {
    public willSendResponse(o: {
        graphqlResponse: GraphQLResponse;
        context: IApolloContext;
    }) {
        const { context, graphqlResponse } = o;

        context.logger.debug('AuditExtension');
        context.metrics.dump();

        // in the other
        if (!graphqlResponse.errors) {
            context.auditor.dump();
        }
    }
}
