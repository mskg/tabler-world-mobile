import { StopWatch } from '@mskg/tabler-world-common';
import { GraphQLExtension } from 'apollo-server-lambda';
import { IApolloContext } from '../types/IApolloContext';

export class TraceRequestExtension extends GraphQLExtension<IApolloContext> {
    public requestDidStart({ context, queryString, variables }: {
        context: IApolloContext,
        queryString?: string,
        variables?: { [key: string]: any },
    }) {
        if (queryString && queryString.indexOf('IntrospectionQuery') > 0) { return; }
        if (!queryString) { return; }

        context.logger.log('Query', queryString);
        if (variables) { context.logger.log('Variables', variables); }

        context.requestCache.timer = new StopWatch();
    }

    // willSendResponse({ _context }: {
    //     _context: IApolloContext,
    // }) {
    public willSendResponse({ context }: { context: IApolloContext }) {
        console.log('query done', context.requestCache.timer?.elapsedMs, 'ms');
    }
}
