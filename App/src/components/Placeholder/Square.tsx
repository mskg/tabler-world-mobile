import React, { PureComponent } from 'react';
import { Animated, View } from 'react-native';
import { COLOR } from './COLOR';

type Props = {
    width: number,
    height?: number,

    style: any,
}

class SquareBase extends PureComponent<Props> {
    render() {
        const { width, height, style } = this.props;

        return (<View style={[{
            height: height || width,
            width: width,
            backgroundColor: COLOR,
        }, style]} />);
    }
}

export const Square = Animated.createAnimatedComponent(SquareBase);