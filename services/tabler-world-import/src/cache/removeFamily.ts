import { Family } from '@mskg/tabler-world-auth-client';

export function removeFamily(id: string) {
    return id
        .replace(`${Family.RTI}_`, '')
        .replace(`${Family.LCI}_`, '')
        .replace(`${Family.OTI}_`, '')
        .replace(`${Family.TCI}_`, '');
}
