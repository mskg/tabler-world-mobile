const { createMetroConfiguration } = require('expo-yarn-workspaces');

const exp = createMetroConfiguration(__dirname);
module.exports = {
    ... exp,
    resolver: {
        ... exp.resolver,
        assetExts: [
            ... exp.resolver.assetExts,
            "md",
            "svg"
        ]
    }
};

