const jsonpatch = require('fast-json-patch');
const { readFileSync, writeFileSync } = require('fs');

let channel = process.env.INFRASTRUCTURE_RELEASE_CHANNEL || "dev";
let version = process.env.APP_VERSION || "0.0.0";
let android = parseInt(version.replace(/[^\d]/ig, ""), 10);

let aws = JSON.parse(readFileSync(__dirname + "/aws.json"));
function findAWSValue(key) {
    const node = aws["Exports"].find(v => v.Name === key);
    return node != null ? node.Value : null;
}

let document = JSON.parse(readFileSync(__dirname + "/app.json"));
const patch = [
    { op: "replace", path: "/expo/slug", value: process.env.APP_SLUG },

    { op: "add", path: "/expo/version", value: version }, // development build
    { op: "add", path: "/expo/android/versionCode", value: android }, // development build

    { op: "replace", path: "/expo/extra/region", value: process.env.AWS_DEFAULT_REGION },
    { op: "replace", path: "/expo/extra/userPoolId", value: findAWSValue(`CognitoUserPool-${channel}`) },
    { op: "replace", path: "/expo/extra/identityPoolId", value: findAWSValue(`CognitoIdentityPool-${channel}`) },
    { op: "replace", path: "/expo/extra/userPoolWebClientId", value: findAWSValue(`CognitoUserPoolClient-${channel}`) },

    { op: "replace", path: "/expo/extra/api", value: process.env.APP_API || `https://${findAWSValue("ApiUrl-" + channel)}` },

    { op: "replace", path: "/expo/extra/sentry", value: process.env.SENTRY },
    { op: "replace", path: "/expo/extra/cognitoAnalytics", value: process.env.ANALYTICS_APPID },
    { op: "replace", path: "/expo/extra/amplitudeAnalytics", value: process.env.AMPLITUDE_KEY },

    { op: "add", path: "/expo/ios/bundleIdentifier", value:  process.env.APP_IOS_BUNDLE },

    { op: "add", path: "/expo/android/package", value: process.env.APP_ANDROID_PACKAGE },
    { op: "add", path: "/expo/android/googleServicesFile", value: "../config/google-services.json" },

    {
        op: "add", path: "/expo/hooks", value: {
            "postPublish": [{
                "file": "sentry-expo/upload-sourcemaps",
                "config": {
                    "organization": process.env.SENTRY_ORG,
                    "project": process.env.SENTRY_PROJECT
                }
            }]
        }
    },
];

patch.forEach(v => {
    if ((v.value === "" || v.value == null) && !v.path.match(/Analytics/)) {
        console.error(`Check env '${v.path}' not available`);
        throw `Check env '${v.path}' not available`;
    }
})

document = jsonpatch.applyPatch(document, patch).newDocument;
writeFileSync(__dirname + "/../app.json", JSON.stringify(document, null, 4));
