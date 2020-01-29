const readline = require('readline');
const fs = require('fs');

// create instance of readline
// each instance is associated with single input stream
let rl = readline.createInterface({
    input: fs.createReadStream('/Users/markus/Downloads/allCountries.txt')
});

let line_no = 0;

// event is emitted after each line
rl.on('line', function (line) {
    line = line.replace('\\', '');
    if (line.split('\t').length === 12) {
        console.log(line);
    }
});
