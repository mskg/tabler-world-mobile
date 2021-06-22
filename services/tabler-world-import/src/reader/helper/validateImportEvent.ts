import { JobType } from '../types/JobType';
import { TargetType } from '../types/TargetType';

/**
 * Check if we have a valid ImportEvent
 */
export function validateImportEvent(payload: any) {
    if (payload == null) {
        throw new Error('Payload must not be null');
    }

    if (payload.type !== JobType.members && payload.type !== JobType.clubs && payload.type !== JobType.structure && payload.type !== JobType.archivedMembers) {
        throw new Error(`Invalid type ${payload.type}`);
    }

    if (payload.offset && typeof payload.offset !== 'number') {
        throw new Error(`Invalid offset ${payload.offset}`);
    }

    if (payload.maxRecords && typeof payload.maxRecords !== 'number') {
        throw new Error(`Invalid maxRecords ${payload.maxRecords}`);
    }

    if (payload.target !== TargetType.RTI && payload.target !== TargetType.LCI && payload.target !== TargetType.C41) {
        throw new Error(`Invalid target ${payload.target}`);
    }
}
