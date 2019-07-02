import { KeyValueCache } from "apollo-server-core";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { IManyKeyValueCache } from "../cache/CacheTypes";
import { IDataSources } from "../dataSources";
import { ILogger } from "./ILogger";
import { IPrincipal } from "./IPrincipal";

export interface IApolloContext {
    lambdaEvent: APIGatewayProxyEvent,
    lambdaContext: Context,

    logger: ILogger,
    principal: IPrincipal,

    cache: KeyValueCache<string> & IManyKeyValueCache<string>,

    requestCache: {[key: string]: any},
    dataSources: IDataSources,
};
