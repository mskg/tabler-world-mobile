import { IDiffSync } from '../IDiffSync';
import { IMember } from '../IMember';
import { IRemoteData } from '../IRemoteData';

export type MemberState = IRemoteData<IMember> & IDiffSync & {
    areas: string[],
    tables: string[],
    roles: string[],
};