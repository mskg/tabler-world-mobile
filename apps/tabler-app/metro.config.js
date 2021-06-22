const { createMetroConfiguration } = require('expo-yarn-workspaces');

const exp = createMetroConfiguration(__dirname);
module.exports = {
    ...exp,
    resolver: {
        ...exp.resolver,
        blacklistRE: /\.webpack/,
        assetExts: [
            ...exp.resolver.assetExts,
            "md",
            "svg"
        ]
    }
};

