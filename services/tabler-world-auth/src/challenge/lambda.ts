import { verifyMaintenance } from '@mskg/tabler-world-auth/src/helper/verifyMaintenance';
import { CognitoUserPoolTriggerHandler } from 'aws-lambda';
import { handler as createHandler } from './create';
import { handler as defineHandler } from './define';
import { handler as verifyHandler } from './verify';

// tslint:disable-next-line: export-name
export const handler: CognitoUserPoolTriggerHandler = async (event, context, callback) => {
    verifyMaintenance();

    if (event.triggerSource === 'DefineAuthChallenge_Authentication') {
        return await defineHandler(event, context, callback);
    }

    if (event.triggerSource === 'CreateAuthChallenge_Authentication') {
        return await createHandler(event, context, callback);
    }

    if (event.triggerSource === 'VerifyAuthChallengeResponse_Authentication') {
        return await verifyHandler(event, context, callback);
    }

    throw new Error(`Unknown source ${event.triggerSource}`);
};
