import * as https from "https";
import * as pg from "pg";
import { EXECUTING_OFFLINE } from "../isOffline";
import { Agent } from "https";
import AWS from "aws-sdk";

// we connect to local HTTP in case of serverless offline
const agent = EXECUTING_OFFLINE
    ? undefined
    : new Agent({
        keepAlive: true,
        rejectUnauthorized: true,
        maxSockets: Number.POSITIVE_INFINITY,
    });

let xAWS: typeof AWS;
let xPG: typeof pg;
let isXrayEnabled = false;
let XRAY: any;
let xHttps: typeof https;

if (EXECUTING_OFFLINE || process.env.XRAY_DISABLED === "true") {
    console.log("Serverless offline detected; skipping AWS X-Ray setup")
    xAWS = require("aws-sdk");
    xPG = require("pg");
    xHttps = require("https");
} else {
    XRAY = require("aws-xray-sdk");
    XRAY.setStreamingThreshold(parseInt(process.env.XRAY_STREAMING_THRESHOLD || "0", 10));

    isXrayEnabled = true;

    xAWS = XRAY.captureAWS(require("aws-sdk"));
    xPG = XRAY.capturePostgres(require("pg"));
    xHttps = XRAY.captureHTTPs(require("https"));

    XRAY.capturePromise();
}

xAWS.config.update({
    httpOptions: {
        agent
    }
});

export { xAWS, xPG, isXrayEnabled, XRAY, xHttps };
