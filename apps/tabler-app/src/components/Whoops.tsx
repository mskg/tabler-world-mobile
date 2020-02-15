import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, Theme, withTheme } from 'react-native-paper';
import { I18N } from '../i18n/translation';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../theme/colors';

type Props = {
    theme: Theme,
    resetError: () => void,
};

class WhoopsBase extends React.Component<Props> {
    render() {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="md-wifi" size={56 * 2} color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} />

                <Text style={styles.emptyText}>{I18N.Component_Whoops.title}</Text>

                {this.props.resetError &&
                    <Button color={this.props.theme.colors.accent} onPress={this.props.resetError}>{I18N.Component_Whoops.try}</Button>
                }
            </View>
        );
    }
}

export const Whoops = withTheme(WhoopsBase);

const styles = StyleSheet.create({

    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyText: {
        fontSize: 30,
        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
    },
});
