import AsyncStorage from '@react-native-community/async-storage';

const KEY = 'OVERRIDE_LANG';
export async function setOverridenLanguage(lang: string) {
    await AsyncStorage.setItem(KEY, lang);
}

export async function getOverridenLanguage() {
    return await AsyncStorage.getItem(KEY);
}

export async function clearOverridenLanguage() {
    await AsyncStorage.removeItem(KEY);
}
