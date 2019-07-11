/**
 * Transforms STDIN to a MD output
 */

const fs = require("fs");

var stdinBuffer = fs.readFileSync(0); // STDIN_FILENO = 0
const json = JSON.parse(stdinBuffer);

/*
 "zen-observable-ts@0.8.18": {
    "licenses": "MIT",
    "repository": "https://github.com/apollographql/apollo-link",
    "publisher": "Evans Hauser",
    "email": "evanshauser@gmail.com",
    "path": "/Users/markus/Projects/tabler-world-mobile/App/node_modules/zen-observable-ts",
    "licenseFile": "/Users/markus/Projects/tabler-world-mobile/App/node_modules/zen-observable-ts/LICENSE"
  },
*/
for (key in json) {
    const val = json[key];
    const vals = key.split('@');

    const version = vals.pop();
    const name = vals.join('@');

    console.log(`- **${name}** v${version} ${val.publisher ? "by " + val.publisher + " " : ""}under ${val.licenses} license - [repository](${val.repository})`);
}

