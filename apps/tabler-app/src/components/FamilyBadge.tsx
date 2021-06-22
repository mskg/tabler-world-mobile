import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { getFamilyColor, getTextColor } from '../theme/getFamilyColor';

type Params = {
    theme, family, familyName, icon?, style?,
};

export const FamilyBadge = ({ theme, family, familyName, style }: Params) => {
    const familyColor = getFamilyColor(family);
    const textColor = getTextColor(family, theme);

    return (
        <View style={[controlStyles.family, { backgroundColor: familyColor }, style || {}]}>
            {/* <View style={styles.icon}>
                <CachedImage
                    cacheGroup="family"
                    resizeMode="cover"
                    uri={icon}
                />
            </View> */}
            <View><Text style={[controlStyles.familyName, { color: textColor }]}>{familyName}</Text></View>
        </View>
    );
};


// tslint:disable-next-line: export-name
const controlStyles = StyleSheet.create({
    family: {
        marginRight: 4,

        // width: 13,
        // height: 13,
        // borderRadius: 13 / 2,

        height: 10,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    familyName: {
        marginLeft: 3,
        marginRight: 3,
        fontSize: 8,
    },
});
