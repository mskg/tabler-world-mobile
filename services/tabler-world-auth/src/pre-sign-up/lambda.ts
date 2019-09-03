import { withClient } from "@mskg/tabler-world-rds-client";
import { CognitoUserPoolTriggerHandler } from "aws-lambda";

// tslint:disable-next-line: export-name
export const handler: CognitoUserPoolTriggerHandler = async (event, context) => {
    await withClient(context, async (client) => {
        const res = await client.query(
            "select * from profiles where rtemail = $1 and removed = FALSE",
            [event.request.userAttributes.email]);

        if (res.rowCount !== 1) {
            throw new Error("You need to be a tabler and you can only sign-in with a 'roundtable.world' e-mail address.");
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
