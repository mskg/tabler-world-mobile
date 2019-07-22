import { Platform } from 'react-native';
import { SafeAreaView } from 'react-navigation';

export function fix2940() {
    // https://github.com/expo/expo/issues/2940
    if (Platform.OS === 'android') {
        //@ts-ignore
        SafeAreaView.setStatusBarHeight(0);
    }
}