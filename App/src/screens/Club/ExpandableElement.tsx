import React, { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Caption, Theme, TouchableRipple, withTheme } from 'react-native-paper';
import { I18N } from '../../i18n/translation';

type ActionProps = {
    field: string,
    text: ReactElement,
    theme: Theme,

    disabled?: boolean,
};

type State = {
    expanded: boolean,
};

class ExpandableElementBase extends React.Component<ActionProps, State> {
    state = {
        expanded: false,
    };

    _toggle = () => {
        this.setState({ expanded: true });
    }

    render() {
        const { field, text } = this.props;

        if (text != null) {
            return (
                <View style={styles.row}>
                    <View style={styles.header}>
                        <Caption>{field}</Caption>
                        {!this.props.disabled && !this.state.expanded &&
                            <TouchableRipple onPress={this._toggle}>
                                <Caption style={{ color: this.props.theme.colors.accent }}>{I18N.Club.expand}</Caption>
                            </TouchableRipple>
                        }
                    </View>
                    {
                        React.cloneElement(text, { expand: this.state.expanded })
                    }
                </View>
            );
        }

        return null;
    }
}

export const ExpandableElement = withTheme(ExpandableElementBase);

export const styles = StyleSheet.create({
    row: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginLeft: 8,
        marginRight: 16,
        marginBottom: 8,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: '100%',

        paddingRight: 24,
    },
});

