import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { Line } from '../../components/Placeholder/Line';
import { Square } from '../../components/Placeholder/Square';
import { styles } from './Styles';

export const CardPlaceholder = ({ count = 10 }) => {
    return (
        <View style={styles.container}>
            {Array.apply(null, { length: count })
                .map(Number.call, Number)
                .map(i => (
                    <Surface style={styles.card} key={i.toString()}>
                        <Square width={Dimensions.get("window").width - 32} height={200} />

                        <View style={innerStyles.headerContainer}>
                            <Line height={30} width={250} />
                        </View>

                        <View style={innerStyles.contentContainer}>
                            <Line height={10} style={innerStyles.subtitle} width={150} />
                            <Line height={10} style={innerStyles.subtitle} width={180} />
                            <Line height={10} style={innerStyles.subtitle} width={120} />
                        </View>
                    </Surface>
                ))}
        </View>
    );
}

const innerStyles = StyleSheet.create({
    headerContainer: {
        marginVertical: 8,
        paddingHorizontal: 16
    },

    contentContainer: {
        marginBottom: 8,
        paddingHorizontal: 16
    },

    subtitle: {
        marginTop: 8
    },
});