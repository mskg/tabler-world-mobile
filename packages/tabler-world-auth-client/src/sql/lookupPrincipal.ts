import { IDataService } from '@mskg/tabler-world-rds-client';
import { IPrincipal } from '../types/IPrincipal';

const MSG = 'Principal not found';

export async function lookupPrincipal(client: IDataService, email: string): Promise<IPrincipal> {
    if (email == null || email === '') {
        throw new Error(MSG);
    }

    const res = await client.query(
        `
select
    profiles.id,
    profiles.club,
    profiles.area,
    profiles.association,
    profiles.family,
    userroles.roles
from
    profiles left join userroles on profiles.id = userroles.id
where
        rtemail = $1
    and removed = false
`,
        [email.toLowerCase()],
    );

    if (res.rowCount !== 1) {
        throw new Error(MSG);
    }

    const { id, club, area, association, family, roles } = res.rows[0];

    // tslint:disable: object-shorthand-properties-first
    return {
        // hardcoded for now
        version: '1.2',
        family,

        id,
        club,
        area,
        association,
        email: email.toLowerCase(),

        roles: roles ? roles.join(',') : '',
    } as IPrincipal;
}
