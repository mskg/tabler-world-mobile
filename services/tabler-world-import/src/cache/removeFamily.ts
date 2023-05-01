import { TargetType } from '../reader/types/TargetType';

export function removeFamily(id: string) {
    return id
        .replace(`${TargetType.RTI}_`, '')
        .replace(`${TargetType.LCI}_`, '')
        .replace(`${TargetType.C41} _`, '')
        .replace(`${TargetType.ACI} _`, '')
        .replace(`${TargetType.TCI} _`, '');
}
