import { reverseGeocode } from '../../helper/geo/reverseGeocode';
import { AddressUpdateInput } from '../../model/graphql/globalTypes';
import { NearbyMembers_nearbyMembers } from '../../model/graphql/NearbyMembers';
import { logger } from './logger';

// const throttledCode = AsyncThrottle(reverseGeocode, 1000, 1);

/**
 * Apollo reuses instances, so we create new ones every time
 */
export const geocodeMissing = async (data: NearbyMembers_nearbyMembers[]) => {
    const newData: AddressUpdateInput[] = [];

    for (const member of data) {
        if (member.address.city == null && member.address.country == null && member.address.location != null) {
            logger.debug('Found missing address');
            const address = await reverseGeocode(member.address.location);

            if (address) {
                newData.push({
                    member: member.member.id,
                    address: address.address,
                });
            }
        }
    }

    return newData.length === 0 ? undefined : newData;
};
