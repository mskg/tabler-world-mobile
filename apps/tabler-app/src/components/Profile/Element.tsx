import React, { ReactNode } from 'react';
import { Clipboard, Platform, View } from 'react-native';
import { Caption, Text, TouchableRipple } from 'react-native-paper';
import { connect } from 'react-redux';
import { I18N } from '../../i18n/translation';
import { addSnack } from '../../redux/actions/snacks';
import { styles } from './Styles';

type ActionProps = {
    field: string,
    text: ReactNode | string,

    onPress?: () => void,
    addSnack: typeof addSnack,
};

// tslint:disable-next-line: no-empty
const VOID = () => { };
const withAnimation = (func) => () => requestAnimationFrame(func || VOID);

class ElementBase extends React.Component<ActionProps> {
    _onLongPress = () => {
        Clipboard.setString(this.props.text as string);
        this.props.addSnack({
            message: I18N.Screen_Member.Actions.clipboard,
            duration: 1000,
        });
    }

    render() {
        const { field, text, onPress } = this.props;

        let display = typeof (text) !== 'string';
        if (!display && text != null) { display = (text as string).trim() !== ''; } else if (text == null) { display = false; }

        const addCopy = typeof (text) === 'string' && Platform.OS === 'android';

        if (display) {
            return (
                // https://github.com/facebook/react-native/pull/24238
                // TouchableRipple onLongPress is not firering for TouchableWithFeedback/-Ripple
                // ... and not without onPress
                <TouchableRipple
                    onPress={
                        addCopy
                            ? withAnimation(onPress) // we always need a press
                            : onPress // otherwise, only we have an onPress
                                ? withAnimation(onPress)
                                : undefined
                    }

                    // iOS does this via selectable text
                    onLongPress={addCopy ? withAnimation(this._onLongPress) : undefined}
                >
                    <View style={styles.row}>
                        <Caption>{field}</Caption>
                        {
                            typeof (text) === 'string'
                                ? <Text selectable={Platform.OS === 'ios'} style={{ flex: 1 }}>{text}</Text>
                                : text
                        }
                    </View>
                </TouchableRipple>
            );
        }

        return null;
    }
}

export const Element = connect(
    null,
    { addSnack },
)(ElementBase);