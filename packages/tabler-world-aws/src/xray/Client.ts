import * as AWS from "aws-sdk";
import { Client as PGClient } from "pg";
import { xAWS, xPG } from "./aws";

//@ts-ignore
export const Client: typeof PGClient = xPG.Client;
export const RDS: typeof AWS.RDS = xAWS.RDS;
