import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import { withClient } from "./withClient";

export const handler: CognitoUserPoolTriggerHandler = async (event, context) => {
    return await withClient(context, async (client) => {
        const email = event.userName;
        console.log("checking", email);

        const res = await client.query("select * from profiles where rtemail = $1 and removed = FALSE", [email]);
        if (res.rowCount !== 1) {
            throw new Error("Sorry, we don't know you.");
        }

        console.log("user found.");
        return event;
    });
};
