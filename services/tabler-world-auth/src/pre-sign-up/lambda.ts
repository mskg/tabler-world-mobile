import { withClient } from '@mskg/tabler-world-rds-client';
import { PreSignUpTriggerHandler } from 'aws-lambda';
import { verifyCountry } from '../helper/verifyCountry';
import { verifyMaintenance } from '../helper/verifyMaintenance';

// tslint:disable-next-line: export-name
export const handler: PreSignUpTriggerHandler = async (event, context) => {
    verifyMaintenance();
    verifyCountry(event.request.userAttributes.email);

    await withClient(context, async (client) => {
        const res = await client.query(
            'select * from profiles where rtemail = $1 and removed = FALSE',
            [event.request.userAttributes.email]);

        if (res.rowCount !== 1) {
            throw new Error('You need to be an active member of LCI, ACI, RTI, or 41I and have a valid Family.WORLD membership. Please sign-in with your \'*@*.world\' e-mail address.');
        }
    });

    // if (event.request.userAttributes.email.match(/@(\d+)\-de\.roundtable\.world$/i) == null) {
    //     throw new Error("You need to be a tabler and you can only sign-in with a 'roundtable.world' e-mail address from Germany.");
    // } else {
    event.response.autoConfirmUser = true;
    (event.response as any).autoVerifyEmail = true;
    // }

    return event;
};
