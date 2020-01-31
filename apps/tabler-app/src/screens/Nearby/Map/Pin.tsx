/* Use this if you are using Expo
import { Svg } from 'expo';
const { Circle, Rect } = Svg;
*/
import React from 'react';
import { View } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { MemberAvatar } from '../../../components/MemberAvatar';

type Props = {
    theme: Theme,
    color: string,

    member: {
        lastname: string | null,
        firstname: string | null,
        pic: string | null,
    };
};


class PinBase extends React.PureComponent<Props> {
    render() {
        return (
            <Svg height="60" width="60" viewBox="0 0 485.2 485.2">
                <G>
                    <Path
                        fill={this.props.color}
                        d="M242.6,0C153.3,0,80.9,72.4,80.9,161.7c0,28.7,7.7,55.6,20.8,79c2.2,3.9,4.5,7.7,7,11.4l133.9,233.1
    	l133.9-233.1c2.1-3.1,3.8-6.3,5.7-9.5l1.3-1.9c13.1-23.4,20.8-50.2,20.8-79C404.3,72.4,331.9,0,242.6,0z"
                        // d="M242.6,0c-100.5,0-182,81.5-182,182s151.6,303.3,182,303.3c30.3,0,182-202.8,182-303.3S343.1,0,242.6,0z"
                    />
                </G>
                <Rect
                    // x="121.3" y="121.9"
                    x="123.1"
                    y="76.1"
                    fill="none"
                    width="242.6"
                    height="181.4"
                />

                <View
                    style={{
                        marginLeft: 14,
                        marginTop: 4,
                    }}
                 >
                    <MemberAvatar
                        size={32}
                        member={this.props.member}

                    />
                </View>
            </Svg>
        );
    }
}

export const Pin = withTheme(PinBase);
