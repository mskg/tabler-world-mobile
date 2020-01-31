import { Audit } from '../../analytics/Audit';
import { AuditEventName } from '../../analytics/AuditEventName';
import { isLocationTaskEnabled } from '../location/isLocationTaskEnabled';
import { updateLocation } from '../location/updateLocation';
import { logger } from './logger';

export async function runLocationUpdate() {
    try {
        if (await isLocationTaskEnabled()) {
            logger.debug('runLocationUpdates');
            Audit.trackEvent(AuditEventName.LocationUpdate);

            // we send a live sign here
            await updateLocation(false, true);
        }
    } catch (error) {
        logger.error(error, 'runLocationUpdate');
    }
}
