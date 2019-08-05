import { KeyValueCache } from "apollo-server-core";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { IManyKeyValueCache } from "../../shared/cache/types";
import { ILogger } from "../../shared/logging/ILogger";
import { IDataSources } from "../dataSources";
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
