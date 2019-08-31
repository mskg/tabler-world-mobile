import { withClient } from "@mskg/tabler-world-rds-client";
import { CustomAuthorizerHandler } from "aws-lambda";
import jwt from "jsonwebtoken";
import { AuthPolicy, HttpVerb } from "./AuthPolicy";
import { downloadPems } from "./downloadPems";
import { Token } from "./types";

// tslint:disable: export-name
// tslint:disable: max-func-body-length
export const handler: CustomAuthorizerHandler = async (event, context) => {
    const iss = "https://cognito-idp."
        + process.env.AWS_REGION
        + ".amazonaws.com/"
        + process.env.UserPoolId;

    const pems = await downloadPems(iss);

    const token = event.authorizationToken;
    if (!token) {
        console.log("No token provided");
        throw new Error("Unauthorized (token)");
    }

    if (token.startsWith("DEMO ")) {
        const awsAccountId = context.invokedFunctionArn.split(":")[4];

        const policy = new AuthPolicy("demo", awsAccountId, apiOptions);
        policy.allowMethod(HttpVerb.OPTIONS, "/graphql-demo");
        policy.allowMethod(HttpVerb.POST, "/graphql-demo");

        const result = policy.build();
        result.usageIdentifierKey = token.substring("DEMO ".length);

        return result;
    }

    // Fail if the token is not jwt
    const decodedJwt = jwt.decode(token, { complete: true }) as Token;
    if (!decodedJwt) {
        console.log("Not a valid JWT token");
        throw new Error("Unauthorized (jwt)");
    }

    // Fail if token is not from your UserPool
    // tslint:disable-next-line: triple-equals
    if (decodedJwt.payload.iss != iss) {
        console.log("invalid issuer");
        throw new Error("Unauthorized (iss)");
    }

    // Reject the jwt if it's not an 'Access Token'
    // tslint:disable-next-line: triple-equals
    if (decodedJwt.payload.token_use != "id") {
        console.log("Not an id token");
        throw new Error(`Unauthorized (${decodedJwt.payload.token_use})`);
    }

    // Get the kid from the token and retrieve corresponding PEM
    const kid = decodedJwt.header.kid;
    const pem = pems[kid];
    if (!pem) {
        console.log("Invalid access token");
        throw new Error("Unauthorized (invalid)");
    }

    const payload: any = jwt.verify(token as string, pem, { issuer: iss });
    console.log(payload);

    // Valid token. Generate the API Gateway policy for the user
    // Always generate the policy on value of 'sub' claim and not for 'username' because username is reassignable
    // sub is UUID for a user which is never reassigned to another user.
    const principalId = payload.sub;

    // Get AWS AccountId and API Options
    const apiOptions: any = {};
    const tmp = event.methodArn.split(":");
    const apiGatewayArnTmp = tmp[5].split("/");
    const awsAccountId = tmp[4];

    apiOptions.region = tmp[3];
    apiOptions.restApiId = apiGatewayArnTmp[0];
    apiOptions.stage = apiGatewayArnTmp[1];

    // var method = apiGatewayArnTmp[2];
    // var resource = '/'; // root resource

    // if (apiGatewayArnTmp[3]) {
    //     resource += apiGatewayArnTmp[3];
    // }

    const policy = new AuthPolicy(principalId, awsAccountId, apiOptions);
    policy.allowMethod(HttpVerb.OPTIONS, "/graphql");
    policy.allowMethod(HttpVerb.GET, "/graphql");
    policy.allowMethod(HttpVerb.POST, "/graphql");

    const result = policy.build();

    return await withClient(context, async (client) => {
        const res = await client.query(
            "select * from profiles where rtemail = $1 and removed = false",
            [payload.email]);

        if (res.rowCount !== 1) {
            throw new Error("User not found");
        }

        const me = res.rows[0];
        result.context = {
            principalId,
            email: payload.email,

            id: me.id,
            club: me.club,
            area: me.area,
            association: me.association,
        };

        // this enforces rate throtteling on the API
        result.usageIdentifierKey = "tabler-world-api-lambda-authorizer-" + apiGatewayArnTmp[1]; // stage

        return result;
    });
};
