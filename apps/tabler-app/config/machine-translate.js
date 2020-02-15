const translate = require('@vitalets/google-translate-api');
const fs = require('fs');

var promises = [];

const sourceLang = "en";
const targetLang = process.argv.length == 3 ? process.argv[2] : "fi";

/* Resources */
var sourceFile = require(`../src/i18n/translations/${sourceLang}_strings.json`);
var targetFile = require(`../src/i18n/translations/${targetLang}_strings.json`);

function translateWeb(source, target, path) {
    Object.keys(source).forEach(key => {
        if (typeof source[key] === "string") {
            if (target[key] == null) {
                promises.push(
                    translate(source[key], { from: sourceLang, to: targetLang }).then(res => {
                        console.log("Translating", path, key, source[key], "=>", res.text);
                        target[key] = res.text
                    }));
            }
            else {
                console.log("Skipping", path, key)
            }
        }
        else {
            target[key] = target[key] || {};
            translateWeb(source[key], target[key], path ? path + "." + key : key);
        }
    });
}

translateWeb(sourceFile, targetFile);

Promise.all(promises).then(() => {
    fs.writeFileSync(__dirname + `/../src/i18n/translations/${targetLang}_strings.json`, JSON.stringify(targetFile, null, 2));
});
