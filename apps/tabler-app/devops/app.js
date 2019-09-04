const { readFileSync } = require("fs");

let ps = JSON.parse(readFileSync(__dirname + "/../app.json"));
console.log(ps.expo.ios.bundleIdentifier);