import React from 'react';
import { Animated } from 'react-native';
import { CachedImage } from '../../components/Image/CachedImage';
import { FullScreenLoading } from '../../components/Loading';

type Props = {
    thumbnailSource: any,
    source: any,
    style?: any,
}

type State = {
}

class ProgressiveImage extends React.PureComponent<Props, State> {
    imageAnimated = new Animated.Value(0);

    render() {
        const {
            thumbnailSource,
            source,
        } = this.props;

        return (
            <CachedImage
                uri={source.uri}
                preview={
                    <>
                        <CachedImage
                            uri={thumbnailSource.uri}
                        />

                        <FullScreenLoading />
                    </>
                }
            />
        );
    }
}

export default ProgressiveImage;
