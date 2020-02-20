module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
        plugins: [
            "import-graphql",
            [
                // we need to replace moment with all locales
                'module-resolver',
                {
                    alias: {
                        "moment": "moment/min/moment-with-locales"
                    }
                }
            ]
        ],
    };
};
