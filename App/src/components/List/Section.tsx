import React from 'react';
import { StyleSheet, View } from "react-native";
import { Title } from 'react-native-paper';
import { ITEM_HEIGHT } from "../Member/Dimensions";

export const SECTION_HEIGHT = ITEM_HEIGHT - 24;

export class Section extends React.PureComponent<{ title, backgroundColor }>  {
    render() {
        return (
            <View style={[styles.group, { backgroundColor: this.props.backgroundColor }]}>
                <Title style={[styles.title]}>{this.props.title}</Title>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    title: {
        lineHeight: SECTION_HEIGHT,
        marginVertical: 0,
        width: "100%",
    },

    group: {
        paddingHorizontal: 16 + 13 /* avatar */,
        paddingVertical: 0,
        height: SECTION_HEIGHT,
    },
});