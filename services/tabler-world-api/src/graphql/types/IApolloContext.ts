import { IManyKeyValueCache } from '@mskg/tabler-world-cache';
import { ILogger } from '@mskg/tabler-world-common';
import { KeyValueCache } from 'apollo-server-core';
import { APIGatewayProxyEvent, Context } from 'aws-lambda';
import { IDataSources } from '../dataSources';
import { IPrincipal } from './IPrincipal';

export interface IApolloContext {
    clientInfo: {
        version: string;
        os?: 'android' | 'ios',
    };

    lambdaEvent?: APIGatewayProxyEvent;
    lambdaContext?: Context;

    logger: ILogger;
    principal: IPrincipal;

    cache: KeyValueCache<string> & IManyKeyValueCache<string>;

    requestCache: { [key: string]: any };
    dataSources: IDataSources;
}
