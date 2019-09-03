import { CognitoUserPoolTriggerHandler } from "aws-lambda";

// tslint:disable-next-line: export-name
export const handler: CognitoUserPoolTriggerHandler = async (event) => {
    console.log("[DEFINE]", event.request.userAttributes.email);

    if (event.request.session &&
        event.request.session.length >= 3 &&
        event.request.session.slice(-1)[0].challengeResult === false) {

        console.error("[DEFINE]", event.request.userAttributes.email, "wrong answer");

        // The user provided a wrong answer 3 times; fail auth
        event.response.issueTokens = false;
        event.response.failAuthentication = true;
    } else if (event.request.session &&
        event.request.session.length &&
        event.request.session.slice(-1)[0].challengeResult === true) {

        console.log("[DEFINE]", event.request.userAttributes.email, "correct answer");

        // The user provided the right answer; succeed auth
        event.response.issueTokens = true;
        event.response.failAuthentication = false;
    } else {
        console.log("[DEFINE]", event.request.userAttributes.email, "providing challenge");

        // The user did not provide a correct answer yet; present challenge
        event.response.issueTokens = false;
        event.response.failAuthentication = false;
        event.response.challengeName = "CUSTOM_CHALLENGE";
    }

    return event;
};
