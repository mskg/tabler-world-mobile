import { withClient } from '@mskg/tabler-world-rds-client';
import { CognitoUserPoolTriggerHandler } from 'aws-lambda';

// tslint:disable-next-line: export-name
export const handler: CognitoUserPoolTriggerHandler = async (event, context) => {
    if (process.env.maintenance === 'true') {
        throw new Error('We\'re sorry, TABLER.APP is currently down for maintenance.');
    }

    const allowed = process.env.allowed_countries?.split(',') || [];
    const found = allowed.find((ext) => event.request.userAttributes.email.endsWith(`-${ext}.roundtable.world`));
    if (!found) {
        throw new Error('You need to be a tabler and you can only sign-in with a \'roundtable.world\' e-mail address.');
    }

    await withClient(context, async (client) => {
        const res = await client.query(
            'select * from profiles where rtemail = $1 and removed = FALSE',
            [event.request.userAttributes.email]);

        if (res.rowCount !== 1) {
            throw new Error('You need to be a tabler and you can only sign-in with a \'roundtable.world\' e-mail address.');
        }
    });

    // if (event.request.userAttributes.email.match(/@(\d+)\-de\.roundtable\.world$/i) === null) {
    //     throw new Error("You need to be a tabler and you can only sign-in with a 'roundtable.world' e-mail address from Germany.");
    // } else {
    event.response.autoConfirmUser = true;
    (event.response as any).autoVerifyEmail = true;
    // }

    return event;
};
