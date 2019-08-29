const slsw = require("serverless-webpack");
const nodeExternals = require("webpack-node-externals");
const path = require("path");

module.exports = {
  entry: slsw.lib.entries,

  // Generate sourcemaps for proper error messages
  devtool: 'source-map',

  // Since 'aws-sdk' is not compatible with webpack,
  // we exclude all node dependencies
  externals: [
    nodeExternals({
      whitelist: [/^@mskg/i],
    }),
    nodeExternals({
      modulesDir: path.resolve(__dirname, '../../node_modules'),
      whitelist: [/^@mskg/i],
    }),
  ],
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
    ],
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
            loader: 'ts-loader'
          }
        ],
      },
      {
        test: /\.(png|jpe?g|gif|html|htm)$/,
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
