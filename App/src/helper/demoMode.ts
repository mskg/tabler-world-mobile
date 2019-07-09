import { AsyncStorage } from 'react-native';

const KEY = "DEMO_MODE";

export async function startDemo() {
    await AsyncStorage.setItem(KEY, "true");
}

export async function isDemoModeEnabled() {
    return (await AsyncStorage.getItem(KEY)) === "true";
}