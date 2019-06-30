const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: slsw.lib.entries,

  // Generate sourcemaps for proper error messages
  devtool: 'source-map',

  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: [nodeExternals()],
  mode: slsw.lib.webpack.isLocal ? "development" : "production",

  optimization: {
    // We no not want to minimize our code.
    minimize: false
  },

  performance: {
    // Turn off size warnings for entry points
    hints: false
  },

  resolve: {
    extensions: [
      '.js',
      '.json',
      '.ts',
      '.tsx'
    ]
  },

  // Run babel on all .js files and skip those in node_modules
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: 'ts-loader'
          }
        ],
      },
      {
        test: /\.(pgsql)$/,
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[path][name].[ext]',
            },
          },
        ],
      },
    ]
  }
};
