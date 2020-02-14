import * as React from 'react';
import { Image, ImageResizeMode } from 'react-native';
import TransformableImage from 'react-native-image-gallery/src/libraries/TransformableImage';
import { CacheGroup } from './Image/CacheGroup';
import CacheManager from './Image/CacheManager';

type Props = {
    // cache
    preview?: React.ReactElement;

    cacheGroup?: CacheGroup;
    changeDetectionOverride?: string;
    uri: string;

    transitionDuration?: number;
    resizeMode?: ImageResizeMode,

    style?: any;
};

type State = {
    uri?: string,
    dimensions?: any,
};

export class TransformableCachedImage extends React.Component<Props, State> {
    state: State = {
    };

    async componentDidMount() {
        const path = await CacheManager.get(this.props.uri, {}, this.props.cacheGroup).getPath();
        Image.getSize(
            path as string,
            (width, height) => {
                this.setState({ uri: path, dimensions: { width, height } });
            },
            (error) => {
                console.warn(error);
            },
        );
    }

    render() {
        if (!this.state.uri) {
            return this.props.preview || null;
        }

        return (
            <TransformableImage
                style={this.props.style}
                image={{
                    source: { uri: this.state.uri },
                    dimensions: this.state.dimensions,
                }}
            />
        );
    }
}
