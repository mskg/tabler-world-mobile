import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { Button, Text, Theme, withTheme } from 'react-native-paper';
import { I18N } from '../i18n/translation';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../theme/colors';

type Props = {
    error: any,
    theme: Theme,
    resetError: () => void,
};

type State = {
    longPressed: boolean;
    count: number;
};

/**
 * Can show error
 *
 * 1. Long press
 * 2..4 Press
 */
class WhoopsBase extends React.Component<Props, State> {
    state: State = {
        longPressed: false,
        count: 0,
    };

    _press = () => {
        if (!this.props.error) {
            return;
        }

        if (this.state.longPressed) {
            this.setState({ count: this.state.count += 1 });
        }

        if (this.state.count >= 3) {
            Alert.alert(
                this.props.error.toString(),
                JSON.stringify(this.props.error),
            );
        }
    }

    render() {
        return (
            <View style={styles.emptyContainer}>
                <TouchableWithoutFeedback onLongPress={() => this.setState({ longPressed: true })} onPress={this._press}>
                    <Ionicons name="md-wifi" size={56 * 2} color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} />
                </TouchableWithoutFeedback>

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
