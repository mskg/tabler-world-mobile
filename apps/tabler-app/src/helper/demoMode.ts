import AsyncStorage from '@react-native-community/async-storage';

const KEY = 'DEMO_MODE';

export async function startDemo() {
    await AsyncStorage.setItem(KEY, 'true');
}

export async function isDemoModeEnabled(): Promise<boolean> {
    return (await AsyncStorage.getItem(KEY)) === 'true';
}
