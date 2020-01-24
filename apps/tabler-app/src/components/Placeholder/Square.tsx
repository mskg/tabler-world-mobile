import React, { PureComponent } from 'react';
import { Animated, View } from 'react-native';
import { COLOR } from './COLOR';
import { Fade } from './Fade';

type Props = {
    width: number,
    height?: number,

    style: any,
};

class SquareBase extends PureComponent<Props> {
    render() {
        const { width, height, style } = this.props;

        return (
            <Fade>
                <View
                    style={[
                        {
                            width,
                            height: height || width,
                            backgroundColor: COLOR,
                        },
                        style,
                    ]}
                />
            </Fade>
        );
    }
}

export const Square = Animated.createAnimatedComponent(SquareBase);
