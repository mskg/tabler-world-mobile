import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, withTheme } from 'react-native-paper';

export const FullScreenLoading = (...props: any[]) =>
    <View style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, styles.center]}>
            <InlineLoading {...props} />
        </View>
    </View>
    ;

class InlineLoadingBase extends React.Component<{ theme }> {
    render() {
        return <ActivityIndicator size="large" color={this.props.theme.colors.accent} />;
    }
}

export const InlineLoading = withTheme(InlineLoadingBase);

const styles = StyleSheet.create({
    image: {
        flex: 1,
        resizeMode: 'contain',
        width: undefined,
        height: undefined,
    },

    center: {
        // top: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
