const slsw = require("serverless-webpack");
const path = require("path");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  entry: slsw.lib.entries,

  // Generate sourcemaps for proper error messages
  devtool: slsw.lib.webpack.isLocal ? 'source-map' : "none",

  // https://github.com/serverless-heaven/serverless-webpack/issues/292
  // this bundles these two dependencies, but removes the indirect depencency to aws-sdk
  externals: [
    nodeExternals({
      whitelist: [/^@mskg/i],
    }),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../node_modules'),
      whitelist: [/^@mskg/i],
    }),
  ],

  mode: slsw.lib.webpack.isLocal ? "development" : "production",

  optimization: {
    // We no not want to minimize our code.
    minimize: true,
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
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      },
      {
        test: /\.ts(x?)$/,
        use: [
          {
            loader: 'ts-loader',
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
