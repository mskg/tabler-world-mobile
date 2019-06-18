const { readFileSync } = require('fs');

const name = (process.argv && process.argv.length > 2) ? process.argv[2] : "channel";

let aws = JSON.parse(readFileSync(__dirname + "/../deployment.json"));
console.log(aws.queryResult[0][name]);
