import React, { PureComponent } from 'react';
import { Animated, View } from 'react-native';
import { COLOR } from './COLOR';

type Props = {
    size: number,
    style: any,
}

class CircleBase extends PureComponent<Props> {
    render() {
        const { size, style } = this.props;

        return (<View style={[{
            height: size,
            width: size,
            borderRadius: size / 2,
            backgroundColor: COLOR,
        }, style]} />);
    }
}

export const Circle = Animated.createAnimatedComponent(CircleBase);