import React from 'react';
import { View } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { TOTAL_HEADER_HEIGHT } from '../theme/dimensions';
import { StandardHeader } from './Header';

export class ScreenBase extends React.Component<{theme: Theme}> {
    render() {
        return (
            <View style={{
                flexGrow: 1,
                paddingTop: TOTAL_HEADER_HEIGHT,
                backgroundColor: this.props.theme.colors.background,
            }}>
                {this.props.children}
            </View>);
    }
}

export const Screen = withTheme(ScreenBase);

export const ScreenWithHeader = ({ children, header }) => (
    <Screen>
        {children}
        <StandardHeader {...{ ...header }} />
    </Screen>
);
