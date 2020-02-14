import { xAWS } from '@mskg/tabler-world-aws';
import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import { randomDigits } from 'crypto-secure-random-digit';
import { verifyCountry } from '../helper/verifyCountry';
import { verifyUser } from '../helper/verifyUser';
import { sendEmail } from './sendEmail';

export const ses = new xAWS.SES();
export const handler: CognitoUserPoolTriggerHandler = async (event, context) => {
    let secretLoginCode: string = '';

    if (!event.request.session || !event.request.session.length) {
        verifyCountry(event.request.userAttributes.email);

        if (!await verifyUser(context, event.request.userAttributes.email)) {
            throw new Error('"Sorry, we don\'t know you. Are you still an active tabler?"');
        }

        // This is a new auth session
        // Generate a new secret login code and mail it to the user
        secretLoginCode = randomDigits(6).join('');

        if (event.callerContext.clientId === process.env.EMAIL_CLIENT) {
            await sendEmail(event.request.userAttributes.email, secretLoginCode);
        }
    } else {
        console.debug('[CREATE]', event.request.userAttributes.email, 're-use session');

        // There's an existing session. Don't generate new digits but
        // re-use the code from the current session. This allows the user to
        // make a mistake when keying in the code and to then retry, rather
        // the needing to e-mail the user an all new code again.
        const previousChallenge = event.request.session.slice(-1)[0];
        secretLoginCode = previousChallenge.challengeMetadata!.match(/CODE-(\d*)/)![1];
    }

    console.log('[CREATE]', event.request.userAttributes.email, 'code', secretLoginCode);

    // This is sent back to the client app
    event.response.publicChallengeParameters = {
        email: event.request.userAttributes.email,
    };

    // Add the secret login code to the private challenge parameters
    // so it can be verified by the "Verify Auth Challenge Response" trigger
    event.response.privateChallengeParameters = { secretLoginCode };

    // Add the secret login code to the session so it is available
    // in a next invocation of the "Create Auth Challenge" trigger
    event.response.challengeMetadata = `CODE-${secretLoginCode}`;

    return event;
};


