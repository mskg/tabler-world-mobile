import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';


export const EmptyComponent = ({ title }) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{title}</Text>
    </View>
);

const styles = StyleSheet.create({

    emptyContainer: {
        flex: 1,
        // height: Dimensions.get('window').height,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 30,
    },
});