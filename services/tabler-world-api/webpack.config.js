let tools = require("@mskg/tabler-world-yarn-tools");
var slsw = require('serverless-webpack');

module.exports = tools.webpack(slsw, __dirname);
