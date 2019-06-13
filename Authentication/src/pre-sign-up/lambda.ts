import { CognitoUserPoolTriggerHandler } from 'aws-lambda';

export const handler: CognitoUserPoolTriggerHandler = async event => {
    if (event.request.userAttributes.email.match(/@(\d+)\-de\.roundtable\.world$/i) === null) {
        throw new Error("You need to be a tabler and you can only sign-in with a 'roundtable.world' e-mail address from Germany.");
    } else {
        event.response.autoConfirmUser = true;
        (event.response as any).autoVerifyEmail = true;
    }

    return event;
};
