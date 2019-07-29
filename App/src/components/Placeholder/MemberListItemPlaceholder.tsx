import React from 'react';
import { StyleSheet, View } from "react-native";
import { Divider } from 'react-native-paper';
import { Circle } from './Circle';
import { Line } from './Line';

export const MemberListItemPlaceholder = ({icon = 38, padding = 0, width = 150}) => {
    return (<>
        <View style={styles.section}>
            <View style={styles.sectionIcon}>
                <Circle size={icon} style={styles.circle} />
            </View>
            <View style={[styles.headerContainer, {paddingTop: padding}]}>
                <Line height={30} width={250} />
                <Line height={14} style={styles.subtitle} width={width}/>
            </View>
        </View>
        <Divider style={styles.divider} />
    </>);
};

const styles = StyleSheet.create({
    circle: {
        margin: 6
    },

    headerContainer: {
        marginVertical: 8,
        marginHorizontal: 8
    },

    subtitle: {
        marginTop: 8
    },

    divider: {
        marginLeft: 16,
    },

    section: {
        flexDirection: "row",
        // paddingVertical: 4,
        alignItems: "flex-start",
    },

    sectionIcon: {
        marginLeft: 8,

        // paddingHorizontal: 16,
        paddingLeft: 0,
        paddingRight: 0,
        paddingVertical: 8,
    },
});
