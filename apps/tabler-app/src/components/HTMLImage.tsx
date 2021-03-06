import React, { PureComponent } from 'react';
import { Image, Text, View } from 'react-native';
import { CachedImage } from './Image/CachedImage';
import CacheManager from './Image/CacheManager';
import { Placeholder } from './Placeholder/Placeholder';
import { Square } from './Placeholder/Square';

type Props = {
    source: any,
    alt?: string,
    height: string | number,
    width: string | number,
    style: any

    imagesMaxWidth?: number,
    imagesInitialDimensions?: {
        width: number,
        height: number,
    },

    passProps?: any,
};

type State = {
    width: number | string,
    height: number | string,
    error?: boolean,
};

export default class HTMLImage extends PureComponent<Props, State> {
    mounted!: boolean;

    static defaultProps = {
        imagesInitialDimensions: {
            width: 100,
            height: 100,
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            width: props.imagesInitialDimensions.width,
            height: props.imagesInitialDimensions.height,
        };
    }

    componentDidMount() {
        this.getImageSize();
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate() {
        this.getImageSize(this.props);
    }

    getDimensionsFromStyle(style, height, width) {
        let styleWidth;
        let styleHeight;

        if (height) {
            styleHeight = height;
        }

        if (width) {
            styleWidth = width;
        }

        if (Array.isArray(style)) {
            style.forEach((styles) => {
                if (!width && styles.width) {
                    styleWidth = styles.width;
                }
                if (!height && styles.height) {
                    styleHeight = styles.height;
                }
            });
        } else {
            if (!width && style.width) {
                styleWidth = style.width;
            }
            if (!height && style.height) {
                styleHeight = style.height;
            }
        }

        return { styleWidth, styleHeight };
    }

    async getImageSize(props = this.props) {
        const { source, imagesMaxWidth, style, height, width } = props;
        const { styleWidth, styleHeight } = this.getDimensionsFromStyle(style, height, width);

        if (styleWidth && styleHeight) {
            if (this.mounted) {
                this.setState({
                    width: typeof styleWidth === 'string' && styleWidth.search('%') !== -1 ? styleWidth : parseInt(styleWidth, 10),
                    height: typeof styleHeight === 'string' && styleHeight.search('%') !== -1 ? styleHeight : parseInt(styleHeight, 10),
                });
            }
            return;
        }

        const path = await CacheManager.get(source.uri, {}).getPath() as string;

        // Fetch image dimensions only if they aren't supplied or if with or height is missing
        Image.getSize(
            // source.uri,
            path,
            (originalWidth, originalHeight) => {
                if (!imagesMaxWidth) {
                    return this.mounted && this.setState({ width: originalWidth, height: originalHeight });
                }

                const optimalWidth = imagesMaxWidth <= originalWidth ? imagesMaxWidth : originalWidth;
                const optimalHeight = (optimalWidth * originalHeight) / originalWidth;

                if (this.mounted) {
                    this.setState({ width: optimalWidth, height: optimalHeight, error: false });
                }
            },
            () => {
                if (this.mounted) { this.setState({ error: true }); }
            },
        );
    }

    validImage(source, style, passProps = {}) {
        return (
            <View style={{ width: this.state.width, height: this.state.height }}>
                <CachedImage
                    cacheGroup="news"
                    uri={source.uri}
                    style={[style, { width: this.state.width, height: this.state.height }]}
                    preview={<Placeholder ready={false} previewComponent={<Square width={this.state.width} height={this.state.height} />} />}
                    resizeMode="cover"
                    {...passProps}
                />
            </View>
        );
    }

    get errorImage() {
        return (
            <View style={{ width: 50, height: 50, borderWidth: 1, borderColor: 'lightgray', overflow: 'hidden', justifyContent: 'center' }}>
                {this.props.alt ? <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>{this.props.alt}</Text> : false}
            </View>
        );
    }

    render() {
        const { source, style, passProps } = this.props;
        return !this.state.error ? this.validImage(source, style, passProps) : this.errorImage;
    }
}
