import { KeyValueCache } from "apollo-server-core";
import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { FilterContext } from "../privacy/FilterContext";
import { ILogger } from "./ILogger";
import { IPrincipal } from "./IPrincipal";

export interface IApolloContext {
    lambdaEvent: APIGatewayProxyEvent,
    lambdaContext: Context,

    logger: ILogger,
    principal: IPrincipal,

    cache: KeyValueCache<string>,
    requestCache: {[key: string]: any},
    filterContext: () => Promise<FilterContext>,
};
