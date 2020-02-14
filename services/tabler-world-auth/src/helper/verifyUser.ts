import { withClient } from '@mskg/tabler-world-rds-client';
import { Context } from 'aws-lambda';

export async function verifyUser(context: Context, email: string): Promise<boolean> {
    return await withClient(context, async (client) => {
        const res = await client.query(
            'select * from profiles where rtemail = $1 and removed = FALSE',
            [email],
        );

        if (res.rowCount !== 1) {
            console.error('[CREATE]', email, 'not found');
            return false;
        }

        return true;
    });
}
