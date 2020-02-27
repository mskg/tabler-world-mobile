import { IManyKeyValueCache } from '@mskg/tabler-world-cache';
import { ILogger } from '@mskg/tabler-world-common';
import { KeyValueCache } from 'apollo-server-core';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { IDataSources } from '../dataSources';
import { IRateLimiter } from '../ratelimit/IRateLimiter';
import { IPrincipal } from './IPrincipal';

type Limiters = 'location' | 'requests';

export interface IApolloContext {
    readonly clientInfo: {
        version: string;
        os?: 'android' | 'ios',
    };

    readonly lambdaEvent?: APIGatewayProxyEvent;
    readonly lambdaContext?: Context;

    readonly logger: ILogger;
    readonly principal: IPrincipal;

    readonly cache: KeyValueCache<string> & IManyKeyValueCache<string>;

    readonly requestCache: { [key: string]: any };
    readonly dataSources: IDataSources;

    getLimiter(name: Limiters): IRateLimiter;
}
