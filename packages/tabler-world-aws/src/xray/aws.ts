import * as AWS from 'aws-sdk';
import https from 'https';
import * as pg from 'pg';
import { EXECUTING_OFFLINE } from '../isServerlessOffline';

let xAWS: typeof AWS;
let xPG: typeof pg;
let isXrayEnabled = false;
let XRAY: any;
let xHttps: typeof https;

// tslint:disable: no-var-requires
if (EXECUTING_OFFLINE || process.env.XRAY_DISABLED === 'true') {
    console.log('Serverless offline detected; skipping AWS X-Ray setup');
    xAWS = require('aws-sdk');
    xPG = require('pg');
    xHttps = require('https');
} else {
    XRAY = require('aws-xray-sdk');
    xAWS = XRAY.captureAWS(require('aws-sdk'));
    xPG = XRAY.capturePostgres(require('pg'));
    xHttps = XRAY.captureHTTPs(require('https'));

    XRAY.setStreamingThreshold(parseInt(process.env.XRAY_STREAMING_THRESHOLD || '0', 10));
    XRAY.capturePromise();
    isXrayEnabled = true;
}

export { xAWS, xPG, isXrayEnabled, XRAY, xHttps };

