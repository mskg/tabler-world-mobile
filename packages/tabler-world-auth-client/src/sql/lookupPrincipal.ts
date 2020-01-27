import { IDataService } from '@mskg/tabler-world-rds-client';
import { IPrincipal } from '../types/IPrincipal';

const MSG = 'Principal not found';
export async function lookupPrincipal(client: IDataService, email: string): Promise<IPrincipal> {
    if (email == null || email === '') {
        throw new Error(MSG);
    }

    const res = await client.query(
        'select id, club, area, association from profiles where rtemail = $1 and removed = false',
        [email.toLowerCase()],
    );

    if (res.rowCount !== 1) {
        throw new Error(MSG);
    }

    const { id, club, area, association } = res.rows[0];
    return {
        // hardcoded for now
        version: '1.2',
        family: 'rti',

        id,
        club,
        area,
        association,
        email: email.toLowerCase(),
    } as IPrincipal;
}
