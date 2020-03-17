#!/usr/bin/env node

const jsonpatch = require("fast-json-patch");
const { readFileSync, writeFileSync } = require("fs");

const removeEmptySlots = (obj) => {
    Object.keys(obj).forEach((key) => {
        if (obj[key] && typeof obj[key] === 'object') {
            removeEmptySlots(obj[key]);
        } else if (obj[key] == null || obj[key] === '') {
            delete obj[key];
        }
    });

    return obj;
};

let channel = process.env.INFRASTRUCTURE_RELEASE_CHANNEL || "dev";
let version = process.env.APP_VERSION || "0.0.0";
let aVersion = process.env.ANDROID_VERSION || version;
let android = parseInt(aVersion.replace(/[^\d]/ig, ""), 10);

let aws = JSON.parse(readFileSync(__dirname + "/aws.json"));
function findAWSValue(key) {
    const node = aws.Exports.find(v => v.Name === key);
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
    { op: "replace", path: "/expo/extra/userPoolWebClientId", value: findAWSValue(`CognitoUserPoolClientPassword-${channel}`) },

    { op: "replace", path: "/expo/extra/api", value: process.env.APP_API || `https://${findAWSValue("ApiUrl-" + channel)}` },
    { op: "replace", path: "/expo/extra/wsapi", value: process.env.APP_WSAPI || `wss://${findAWSValue("ApiWSUrl-" + channel)}` },
    { op: "replace", path: "/expo/extra/apidemo", value: process.env.DEMO_API_KEY },

    { op: "replace", path: "/expo/extra/sentry", value: process.env.SENTRY },
    { op: "replace", path: "/expo/extra/cognitoAnalytics", value: process.env.ANALYTICS_APPID },
    { op: "replace", path: "/expo/extra/amplitudeAnalytics", value: process.env.AMPLITUDE_KEY },

    { op: "add", path: "/expo/ios/bundleIdentifier", value: process.env.APP_IOS_BUNDLE },

    { op: "add", path: "/expo/android/package", value: process.env.APP_ANDROID_PACKAGE },
    { op: "add", path: "/expo/android/googleServicesFile", value: "../../config/google-services.json" },

    {
        op: "add", path: "/expo/hooks", value: {
            "postPublish": [{
                "file": "sentry-expo/upload-sourcemaps",
                "config": {
                    "organization": process.env.SENTRY_ORG,
                    "project": process.env.SENTRY_PROJECT,
                },
            }],
        },
    },

    { op: "add", path: "/expo/android/config/googleMaps/apiKey", value: process.env.API_KEY_GOOGLE_MAPS_ANDROID },
    { op: "add", path: "/expo/ios/config/googleMapsApiKey", value: process.env.API_KEY_GOOGLE_MAPS_IOS },
];

// Write permission strings
const en = require('../src/i18n/translations/en_strings.json');
Object.keys(en.Permissions).forEach((p) => {
    patch.push({
        op: 'replace',
        path: `/expo/ios/infoPlist/${p}`,
        value: en.Permissions[p],
    })
});

// Write permission strings for other languages
const additionalLocales = (process.env.APP_LANGUAGES || 'de')
    .split(',')
    .filter((l) => l !== 'en');

// write supported languages for getAppLanguage
patch.push({
    op: 'replace',
    path: `/expo/extra/appLanguages`,
    value: ['en', ...additionalLocales],
});

for (const loc of additionalLocales) {
    const lang = require(`../src/i18n/translations/${loc}_strings.json`);
    const perm = {
        ...en.Permissions,
        ... (removeEmptySlots(lang.Permissions) || {})
    };

    writeFileSync(__dirname + `/../src/i18n/permissions/${loc}.json`, JSON.stringify(perm, null, 4));

    patch.push({
        op: 'add',
        path: `/expo/locales/${loc}`,
        value: `./src/i18n/permissions/${loc}.json`,
    });
}

// validate
patch.forEach(v => {
    if ((v.value === "" || v.value == null) && !v.path.match(/Analytics/)) {
        console.error(`Check env '${v.path}' not available`);
        throw new Error(`Check env '${v.path}' not available`);
    }
});

// Write final file
document = jsonpatch.applyPatch(document, patch).newDocument;
writeFileSync(__dirname + "/../app.json", JSON.stringify(document, null, 4));
