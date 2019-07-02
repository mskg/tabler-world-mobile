// import * as AWS from "aws-sdk";
// import * as PG from "pg";
import { EXECUTING_OFFLINE } from "../helper/isOffline";

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

export { xAWS, xPG, isXrayEnabled, XRAY };

