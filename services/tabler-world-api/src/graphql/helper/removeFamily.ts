import { Family } from '@mskg/tabler-world-auth-client';

// this is duplicated code
export function removeFamily(id: string) {
    return id
        .replace(`${Family.RTI}_`, '')
        .replace(`${Family.LCI}_`, '')
        .replace(`${Family.C41}_`, '')
        .replace(`${Family.ACI}_`, '')
        .replace(`${Family.TCI}_`, '');
}
