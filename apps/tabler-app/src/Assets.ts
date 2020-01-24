const ASSETS = '../assets';

export default {
    fonts: {
        normal: require(ASSETS + '/fonts/dejavu-sans/DejaVuSansCondensed.ttf'),
        bold: require(ASSETS + '/fonts/dejavu-sans/DejaVuSansCondensed-Bold.ttf'),
        light: require(ASSETS + '/fonts/dejavu-sans/DejaVuSans-ExtraLight.ttf'),
    },

    images: {
        icon: require(ASSETS + '/images/logo_iOS.png'),
        logo: require(ASSETS + '/images/logo_App_Logo.png'),
        splash: require(ASSETS + '/images/splash.png'),
        background: require(ASSETS + '/images/background.png'),
        mask: require(ASSETS + '/images/logo_mask.png'),
    },

    files: {
        about: require(ASSETS + '/docs/about.md'),
        license: require(ASSETS + '/docs/licenses.md'),
        releasenotes: require(ASSETS + '/docs/releasenotes.md'),
    },
};
