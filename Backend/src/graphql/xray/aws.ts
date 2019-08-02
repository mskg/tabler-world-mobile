// import * as AWS from "aws-sdk";
// import * as PG from "pg";
import https from "https";
import { EXECUTING_OFFLINE } from "../helper/isOffline";

// we connect to local HTTP in case of serverless offline
const agent = EXECUTING_OFFLINE
    ? undefined
    : new https.Agent({
        keepAlive: true,
        rejectUnauthorized: true,
        maxSockets: Number.POSITIVE_INFINITY,
    });

let xAWS: any;
let xPG: any;
let isXrayEnabled = false;
let XRAY: any;

if (EXECUTING_OFFLINE && process.env.XRAY_DISABLED !== "true") {
    console.log("Serverless offline detected; skipping AWS X-Ray setup")
    xAWS = require("aws-sdk");
    xPG = require("pg");
} else {
    XRAY = require("aws-xray-sdk");
    XRAY.setStreamingThreshold(parseInt(process.env.XRAY_STREAMING_THRESHOLD || "0", 10));

    isXrayEnabled = true;

    xAWS = XRAY.captureAWS(require("aws-sdk"));
    xPG = XRAY.capturePostgres(require("pg"));

    XRAY.capturePromise();
}

xAWS.config.update({
    httpOptions: {
        agent
    }
});

export { xAWS, xPG, isXrayEnabled, XRAY };
