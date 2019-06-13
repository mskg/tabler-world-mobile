import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { Client } from "pg";
import { FilterContext } from "../privacy/FilterContext";
import { ILogger } from "./ILogger";
import { IPrincipal } from "./IPrincipal";

export interface IApolloContext {
    lambdaEvent: APIGatewayProxyEvent,
    lambdaContext: Context,

    logger: ILogger,
    principal: IPrincipal,
    cache: {[key: string]: any},
    filterContext: (client: Client) => Promise<FilterContext>,
};
