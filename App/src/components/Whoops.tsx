import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, withTheme } from 'react-native-paper';
import { I18N } from '../i18n/translation';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../theme/colors';

export const Whoops = withTheme(({ theme, resetError }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="md-wifi" size={56 * 2} color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} />

        <Text style={styles.emptyText}>{I18N.Whoops.title}</Text>

        {resetError &&
            <Button color={theme.colors.accent} onPress={resetError}>{I18N.Whoops.try}</Button>}
    </View>
));

const styles = StyleSheet.create({

    emptyContainer: {
        flex: 1,
        // height: Dimensions.get('window').height,
        alignItems: 'center',
        justifyContent: 'center',
    },

    emptyText: {
        fontSize: 30,
        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
    },
});
