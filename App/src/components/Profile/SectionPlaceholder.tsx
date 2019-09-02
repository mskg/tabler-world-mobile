import React from 'react';
import { Dimensions, View } from 'react-native';
import { Divider } from 'react-native-paper';
import { Circle } from '../Placeholder/Circle';
import { Line } from '../Placeholder/Line';
import { Square } from '../Placeholder/Square';
import { styles } from './Styles';

export const SectionPlaceholder = () => {
    return (<>
        <View style={styles.section}>
            <View style={styles.sectionIcon}>
                <Circle size={35} style={{ margin: 6 }} />
            </View>
            <View style={{ marginVertical: 8, marginHorizontal: 8 }}>
                <Line height={14} width={200} />
                <Line height={30} style={{ marginTop: 8 }} width={Dimensions.get('window').width - 80} />
            </View>
        </View>
        <Divider style={styles.divider} />
    </>);
};

export const SectionsPlaceholder = ({ count }) => (
    <>
        {Array.apply(null, { length: count || 4 }).map(Number.call, Number).map(i => (<SectionPlaceholder key={i} />))}
    </>);

export const SectionSquarePlaceholder = () => {
    return (<>
        <View style={styles.section}>
            <View style={styles.sectionIcon}>
                <Circle size={35} style={{ margin: 6 }} />
            </View>
            <View style={{ marginVertical: 8, marginHorizontal: 8 }}>
                <Line height={14} width={200} />
                <Square style={{
                    marginTop: 8, borderRadius: 10,
                }} width={Dimensions.get('window').width - 80} height={120} />
            </View>
        </View>
        <Divider style={styles.divider} />
    </>);
};
