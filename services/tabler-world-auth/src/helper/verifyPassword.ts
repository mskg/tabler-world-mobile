import { withClient } from '@mskg/tabler-world-rds-client';
import { Context } from 'aws-lambda';
import request from 'request';

export async function verifyPassword(context: Context, email: string, password: string): Promise<boolean> {
    return await withClient(context, async (client) => {
        const res = await client.query(
            `
select data->>'uname' as uname, id
from tabler
where data->>'rt_generic_email' = $1
            `,
            [email],
        );

        if (res.rowCount !== 1) {
            console.error('[verifyPassword]', email, 'not found');
            return false;
        }

        let community = 5;
        if (email.match(/ladiescircle/ig)) {
            community = 4335;
        }

        const foundId = await new Promise((resolve) => {
            // Download the JWKs and save it as PEM
            request(
                {
                    url: `https://api.roundtable.world/v1/user/communities/login/`,
                    method: 'POST',
                    json: true,
                    body: {
                        password,
                        username: res.rows[0].uname,
                        community_id: community,
                    },
                },

                (error, response, body) => {
                    console.log('[verifyPassword]', email, error, body);

                    if (!error && response.statusCode === 200) {
                        resolve(body?.result?.user?.id || -1);
                    } else {
                        resolve(-1);
                    }
                });
        });

        console.log('[verifyPassword]', 'password', res.rows[0], foundId);

        // ids must be equal
        return foundId === res.rows[0].id;
    });
}
