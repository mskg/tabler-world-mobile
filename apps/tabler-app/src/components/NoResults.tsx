import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { I18N } from '../i18n/translation';


export const EmptyComponent = ({ title }) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{title}</Text>
    </View>
);

export const CannotLoadWhileOffline = () => (
    <EmptyComponent title={I18N.Component_Whoops.offline} />
);

const styles = StyleSheet.create({

    emptyContainer: {
        flex: 1,
        // height: Dimensions.get('window').height,
        alignItems: 'center',
        justifyContent: 'center',

        marginHorizontal: 16,
    },

    emptyText: {
        fontSize: 30,
        textAlign: 'center',
    },
});
