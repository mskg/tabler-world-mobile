import { GraphQLResponse } from 'apollo-server-core';
import { GraphQLExtension } from 'apollo-server-lambda';
import { IApolloContext } from '../types/IApolloContext';
import { captureException } from './captureException';

export class SendErrorsToSentryExtension extends GraphQLExtension<IApolloContext> {
    willSendResponse(o: {
        graphqlResponse: GraphQLResponse;
        context: IApolloContext;
    }) {
        const { context, graphqlResponse } = o;

        if (graphqlResponse.errors) {
            graphqlResponse.errors.forEach(err =>
                captureException(context.lambdaEvent, context.lambdaContext, err));
        }

        return o;
    }
}
