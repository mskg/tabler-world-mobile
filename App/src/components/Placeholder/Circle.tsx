import React, { PureComponent } from 'react';
import { Animated, View } from 'react-native';
import { COLOR } from './COLOR';
import { Fade } from './Fade';

type Props = {
    size: number,
    style: any,
};

class CircleBase extends PureComponent<Props> {
    render() {
        const { size, style } = this.props;

        return (
            <Fade>
                <View style={[{
                    height: size,
                    width: size,
                    borderRadius: size / 2,
                    backgroundColor: COLOR,
                }, style]} />
            </Fade>);
    }
}

export const Circle = Animated.createAnimatedComponent(CircleBase);
