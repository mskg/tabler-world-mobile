import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Surface } from 'react-native-paper';
import { Circle } from '../../components/Placeholder/Circle';
import { Line } from '../../components/Placeholder/Line';
import { styles } from './Styles';

export const CardPlaceholder = ({ count = 10 }) => {
    return (
        <View style={styles.container}>
            {Array.apply(null, { length: count })
                .map(Number.call, Number)
                .map(i => (
                    <Surface style={styles.card} key={i.toString()}>
                        <View style={innerStyles.section}>
                            <View style={innerStyles.sectionIcon}>
                                <Circle size={50} style={innerStyles.circle} />
                            </View>
                            <View style={[innerStyles.headerContainer, { paddingTop: 8 }]}>
                                <Line height={30} width={250} />
                                <Line height={14} style={innerStyles.subtitle} width={150} />
                            </View>
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
};

const innerStyles = StyleSheet.create({
    circle: {
        margin: 6,
    },

    headerContainer: {
        marginVertical: 8,
        paddingHorizontal: 8,
    },

    contentContainer: {
        marginVertical: 8,
        paddingHorizontal: 16,
    },

    subtitle: {
        marginTop: 8,
    },

    divider: {
        marginLeft: 16,
    },

    section: {
        flexDirection: 'row',
        // paddingVertical: 4,
        alignItems: 'flex-start',
    },

    sectionIcon: {
        marginLeft: 8,

        // paddingHorizontal: 16,
        paddingLeft: 0,
        paddingRight: 0,
        paddingVertical: 8,
    },
});
