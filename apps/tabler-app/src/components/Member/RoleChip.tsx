import React from 'react';
import { Text, View } from 'react-native';
import { styles } from './Styles';

type Props = {
    text: string,
    level: any,
    font: string,
    color: string,
    textColor: string,
};

export class RoleChip extends React.PureComponent<Props> {
    render() {
        const { text, level, font, color, textColor } = this.props;

        return (
            <View style={[styles.chip, { backgroundColor: color }]}>
                {typeof level === 'object' && level}
                <Text style={[styles.chipText, { color: textColor }]}>
                    {level && typeof level !== 'object' && level !== '' && <Text>{level} </Text>}
                    <Text style={{ fontFamily: font }}>{text}</Text>
                </Text>
            </View>
        );
    }
}
