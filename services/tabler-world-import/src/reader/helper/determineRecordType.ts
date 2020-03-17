import { RecordType } from '../../shared/RecordType';
import { JobType } from '../types/JobType';

export function determineRecordType(job: JobType, record: any): RecordType {
    if (job === JobType.clubs) {
        if (record.level === 2) {
            return RecordType.area;
        }

        if (record.level === 3) {
            return RecordType.association;
        }

        if (record.level === 4) {
            return RecordType.family;
        }
        return RecordType.club;
    }

    if (job === JobType.structure) {
        return RecordType.group;
    }

    if (job === JobType.archivedMembers) {
        return RecordType.member;
    }

    return RecordType.member;
}
