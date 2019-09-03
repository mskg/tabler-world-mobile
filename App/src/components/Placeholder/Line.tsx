import React, { PureComponent } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLOR } from './COLOR';
import { Fade } from './Fade';

type Props = {
    height?: number,
    width?: any,
    style?: any,
    // backgroundColor: any,
};

export class Line extends PureComponent<Props> {
    render() {
        const { height, width, style } = this.props;
        const textSize = height || 12;

        return (
            <Fade>
                <View style={StyleSheet.flatten([{
                    height: textSize,
                    width: width || '100%',
                    borderRadius: textSize / 4,
                    backgroundColor: COLOR,
                }, style])} />
            </Fade>);
    }
}
