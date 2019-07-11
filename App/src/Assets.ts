const ASSETS = '../assets';

export default {
    fonts: {
        normal: require(ASSETS + '/fonts/dejavu-sans/DejaVuSansCondensed.ttf'),
        bold: require(ASSETS + '/fonts/dejavu-sans/DejaVuSansCondensed-Bold.ttf'),
        light: require(ASSETS + '/fonts/dejavu-sans/DejaVuSans-ExtraLight.ttf'),
    },

    images: {
        icon: require(ASSETS + '/images/icon.png'),
        logo: require(ASSETS + '/images/logo.png'),
        splash: require(ASSETS + '/images/splash.png'),
        background: require(ASSETS + '/images/background.png'),
    },

    files: {
        about: require(ASSETS + '/docs/about.md'),
        license: require(ASSETS + '/docs/licenses.md'),
        releasenotes: require(ASSETS + '/docs/releasenotes.md'),
    }
}