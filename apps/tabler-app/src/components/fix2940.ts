import { Platform } from 'react-native';
import { SafeAreaView } from 'react-navigation';
import { HEADER_MARGIN_TOP } from '../theme/dimensions';

export function fix2940() {
    // https://github.com/expo/expo/issues/2940
    if (Platform.OS === 'android' && SafeAreaView.setStatusBarHeight) {
        // @ts-ignore method exists, types are wrong
        SafeAreaView.setStatusBarHeight(HEADER_MARGIN_TOP);
    }
}
