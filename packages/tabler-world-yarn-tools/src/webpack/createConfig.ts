import { resolve } from 'path';
import slsw from 'serverless-webpack';
import nodeExternals from 'webpack-node-externals';

export default function createConfig(path: string = __dirname) {
    console.log('Resolving', resolve(path, '../../node_modules'));

    return {
        entry: slsw.lib.entries,

        // Generate sourcemaps for proper error messages
        devtool: slsw.lib.webpack.isLocal ? 'source-map' : 'none',

        // https://github.com/serverless-heaven/serverless-webpack/issues/292
        // this bundles these two dependencies, but removes the indirect depencency to aws-sdk
        externals: [
            nodeExternals({
                whitelist: [/^@mskg/i],
            }),

            nodeExternals({
                modulesDir: resolve(path, '../../node_modules'),
                whitelist: [/^@mskg/i],
            }),
        ],

        mode: slsw.lib.webpack.isLocal ? 'development' : 'production',

        optimization: {
            // We no not want to minimize our code.
            minimize: true,
        },

        performance: {
            // Turn off size warnings for entry points
            hints: false,
        },

        resolve: {
            extensions: [
                '.js',
                '.json',
                '.ts',
                '.tsx',
            ],
        },

        // Run babel on all .js files and skip those in node_modules
        module: {
            rules: [
                {
                    test: /\.mjs$/,
                    include: /node_modules/,
                    type: 'javascript/auto',
                },
                {
                    test: /\.ts(x?)$/,
                    use: [
                        {
                            loader: 'ts-loader',
                        },
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
            ],
        },
    };
}
