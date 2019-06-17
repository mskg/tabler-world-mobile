import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import { randomDigits } from 'crypto-secure-random-digit';
import { SES } from 'aws-sdk';
import { sendEmail } from './sendEmail';
import { withDatabase } from '../withDatabase';

export const ses = new SES();
export const handler: CognitoUserPoolTriggerHandler = async (event, context) => {
    let secretLoginCode: string = "";

    if (!event.request.session || !event.request.session.length) {
        await withDatabase(context, async (client) => {
            const res = await client.query(
                "select * from profiles where rtemail = $1 and removed = FALSE",
                [event.request.userAttributes.email]);

            if (res.rowCount !== 1) {
                throw new Error("Sorry, we don't know you.");
            }
            // This is a new auth session
            // Generate a new secret login code and mail it to the user
            secretLoginCode = randomDigits(6).join('');
            await sendEmail(event.request.userAttributes.email, secretLoginCode);
        });
    } else {
        // There's an existing session. Don't generate new digits but
        // re-use the code from the current session. This allows the user to
        // make a mistake when keying in the code and to then retry, rather
        // the needing to e-mail the user an all new code again.    
        const previousChallenge = event.request.session.slice(-1)[0];
        secretLoginCode = previousChallenge.challengeMetadata!.match(/CODE-(\d*)/)![1];
    }

    // This is sent back to the client app
    event.response.publicChallengeParameters = { email: event.request.userAttributes.email };

    // Add the secret login code to the private challenge parameters
    // so it can be verified by the "Verify Auth Challenge Response" trigger
    event.response.privateChallengeParameters = { secretLoginCode };

    // Add the secret login code to the session so it is available
    // in a next invocation of the "Create Auth Challenge" trigger
    event.response.challengeMetadata = `CODE-${secretLoginCode}`;

    return event;
};


