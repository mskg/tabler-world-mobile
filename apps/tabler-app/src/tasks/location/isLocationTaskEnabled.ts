import AsyncStorage from '@react-native-community/async-storage';
import { LOCATION_TASK_NAME } from '../Constants';

export async function isLocationTaskEnabled() {
    return await AsyncStorage.getItem(LOCATION_TASK_NAME) === 'true';
}
