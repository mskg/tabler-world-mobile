import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import { verifyPassword } from '../helper/verifyPassword';

// tslint:disable-next-line: export-name
export const handler: CognitoUserPoolTriggerHandler = async (event, context) => {
    console.log('[VERFIY]', event.request.userAttributes.email);

    if (event.callerContext.clientId !== process.env.EMAIL_CLIENT) {
        event.response.answerCorrect = await verifyPassword(
            context,
            event.request.userAttributes.email,
            event.request.challengeAnswer as string,
        );

        return event;
    }

    const expectedAnswer = event.request.privateChallengeParameters!.secretLoginCode;
    console.log('[VERFIY]', event.request.userAttributes.email, 'expected', expectedAnswer, `is '${event.request.challengeAnswer}'`);

    if (event.request.challengeAnswer === expectedAnswer) {
        event.response.answerCorrect = true;
    } else {
        event.response.answerCorrect = false;
    }

    return event;
};
