import { DocumentClient as DC } from "aws-sdk/clients/dynamodb";
import { xAWS } from "./aws";

export const DocumentClient: typeof DC = xAWS.DynamoDB.DocumentClient;
