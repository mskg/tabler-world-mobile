import React from 'react';
import { StyleSheet, View } from "react-native";
import { Divider } from 'react-native-paper';
import { Circle } from '../Placeholder/Circle';
import { Line } from '../Placeholder/Line';

export const RolePlaceholder = () => {
    return (<>
        <View style={styles.section}>
            <View style={styles.sectionIcon}>
                <Circle size={35} style={styles.circle} />
            </View>
            <View style={styles.headerContainer}>
                <Line height={30} width={250} />
                <Line height={14} style={styles.subtitle} width={150} />
            </View>
        </View>
        <Divider style={styles.divider} />
    </>);
};

export const RolesPlaceholder = ({ count }) => (
    <>
        {Array.apply(null, { length: count || 4 }).map(Number.call, Number).map(i => (<RolePlaceholder key={i} />))}
    </>);


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
