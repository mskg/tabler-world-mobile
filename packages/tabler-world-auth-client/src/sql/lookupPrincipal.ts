import { IDataService } from '@mskg/tabler-world-rds-client';
import { AuthenticationError } from 'apollo-server-core';
import { IPrincipal } from '../types/IPrincipal';

/**
 * Searches for the given principal in the database.
 *
 * @param client
 * @param email
 */
export async function lookupPrincipal(client: IDataService, email: string): Promise<IPrincipal> {
    if (email == null || email === '') {
        throw new Error('Principal <null> not found');
    }

    const principal = email.toLowerCase();
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
        [principal],
    );

    if (res.rowCount !== 1) {
        throw new AuthenticationError(`Principal ${principal} not found`);
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

        roles,
    } as IPrincipal;
}
