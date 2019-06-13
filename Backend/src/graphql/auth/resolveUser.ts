import { AuthenticationError } from "apollo-server-core";
import { APIGatewayProxyEvent } from "aws-lambda";

export function resolveUser(event: APIGatewayProxyEvent) {
    const authorizer = event.requestContext.authorizer;
    if (authorizer == null) {
        throw new AuthenticationError("Authorizer missing");
    }

    let resolvedEmail = null;

    if (event.requestContext.stage == "dev" && authorizer.principalId === "offlineContext_authorizer_principalId") {
        console.warn("********* AUTHENTICATION DEBUG MODE *********");
        resolvedEmail = process.env.API_DEBUG_USER;
    }
    else {
        const { iss, email } = authorizer.claims || { iss: null, email: null };
        console.log("authorized", email, "via", iss);

        if (email == null || email === "") {
            throw new AuthenticationError("EMail claim missing");
        }
        else {
            resolvedEmail = email;
        }
    }

    return resolvedEmail;
}
