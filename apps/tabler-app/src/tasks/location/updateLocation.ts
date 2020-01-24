import * as Location from 'expo-location';
import { handleLocationUpdate } from './handleLocationUpdate';

export async function updateLocation(enable = false, force = false): Promise<boolean> {
    const location = await Location.getCurrentPositionAsync();
    return await handleLocationUpdate([location], enable, force);
}
