import * as AWS from "aws-sdk";
import { xAWS } from "./aws";

export const DocumentClient: typeof AWS.DynamoDB.DocumentClient = xAWS.DynamoDB.DocumentClient;
