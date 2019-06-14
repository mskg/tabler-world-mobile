import React, { ReactNode } from 'react';
import { View } from "react-native";
import { Caption, Text, TouchableRipple } from 'react-native-paper';
import { styles } from './Styles';

type ActionProps = {
    field: string,
    text: ReactNode | string,
    onPress?: () => void,
}

export const Element = ({ field, text, onPress }: ActionProps) => {
    let display = typeof(text) !== "string";
    if (!display && text != null) {display = (text as string).trim() !== "";}
    else if (text == null) {display = false;}

    console.log(display, "#", text, "#")

    if (display) {
        return (
            <TouchableRipple onPress={onPress}>
                <View style={styles.row}>
                    <Caption>{field}</Caption>
                    {
                        typeof (text) === "string"
                            ? <Text selectable={true} style={{ width: "100%" }}>{text}</Text>
                            : text
                    }
                </View>
            </TouchableRipple>
        );
    }

    return null;
}

// type ActionProps = {
//     theme: Theme,
//     text: string,
//     onPress?: () => void,
//     canCopyText?: boolean,
// }

// export const ActionElement = ({ theme, text, onPress, canCopyText }: ActionProps) => {
//     return (
//         <TouchableRipple onPress={() => requestAnimationFrame(onPress)}>
//             <View style={styles.row}>
//                 <Text style={{ color: theme.colors.accent }}>{text}</Text>
//             </View>
//         </TouchableRipple>
//     );
// }