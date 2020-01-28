import * as AWS from 'aws-sdk';
import { Client as PGClient, Pool as PGPool } from 'pg';
import { xAWS, xPG } from './aws';

export const Client: typeof PGClient = xPG.Client;
export const Pool: typeof PGPool = xPG.Pool;
export const RDS: typeof AWS.RDS = xAWS.RDS;
