import _ from 'lodash';
import { IAssociationRole } from '../model/IAssociationRole';
import { RoleOrderByMapping } from '../model/IRole';
import { Categories, Logger } from './Logger';

const logger = new Logger(Categories.Screens.Structure);

export function sortRoles(roles?: IAssociationRole[] | null): IAssociationRole[] | undefined {
    if (roles == null || roles.length === 0) return undefined;

    return _(roles)
        .sortBy((r) => {
            const mapped = RoleOrderByMapping[r.role];
            if (mapped == null) {
                logger.log('Failed to map', r.role);
            }

            return mapped || 99;
        })
        // .groupBy(r => r.member)
        // .map((v, k) => ({
        //     member: parseInt(k, 10),
        //     role: _(v).map(f => f.role).toArray().value().join(', ')
        // }))
        .toArray()
        .value();
}

type Role = {
    role: string,
    member: {
        id: number,
    },
};

export function sortGroupRoles<T extends Role>(roles?: T[] | null): T[] | undefined {
    if (roles == null || roles.length === 0) return undefined;

    // @ts-ignore subtype is valid
    return _(roles)
        .groupBy((r) => r.member.id)
        .map((v, _k) => ({
            member: v[0].member,
            role: _(v).map((f) => f.role).toArray().value().join(', '),
            sortrole: RoleOrderByMapping[v[0].role] || 99,
        }))
        .sortBy((r) => r.sortrole)
        .toArray()
        .value();
}
