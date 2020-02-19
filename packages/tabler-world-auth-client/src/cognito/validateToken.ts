import { AuthenticationError } from 'apollo-server-core';
import jwt from 'jsonwebtoken';
import { downloadPems } from './downloadPems';
import { Token } from './types';

type ValidationResult = {
    email: string,
    principalId: string,
};

export async function validateToken(
    region: string,
    poolId: string,
    token: string,
): Promise<ValidationResult> {
    const iss = `https://cognito-idp.${region}.amazonaws.com/${poolId}`;
    const pems = await downloadPems(iss);

    // Fail if the token is not jwt
    const decodedJwt = jwt.decode(token, { complete: true }) as Token;
    if (!decodedJwt) {
        console.log('Not a valid JWT token');
        throw new AuthenticationError('Unauthorized (jwt)');
    }

    // Fail if token is not from your UserPool
    if (decodedJwt.payload.iss !== iss) {
        console.log('invalid issuer');
        throw new AuthenticationError('Unauthorized (iss)');
    }

    // Reject the jwt if it's not an 'ID Token'
    if (decodedJwt.payload.token_use !== 'id') {
        console.log('Not an id token');
        throw new AuthenticationError(`Unauthorized (${decodedJwt.payload.token_use})`);
    }

    // Get the kid from the token and retrieve corresponding PEM
    const kid = decodedJwt.header.kid;
    const pem = pems[kid];
    if (!pem) {
        console.log('Invalid access token');
        throw new AuthenticationError('Unauthorized (invalid)');
    }

    const payload: any = jwt.verify(token as string, pem, { issuer: iss });

    // Valid token. Generate the API Gateway policy for the user
    // Always generate the policy on value of 'sub' claim and not for 'username' because username is reassignable
    // sub is UUID for a user which is never reassigned to another user.
    const principalId = payload.sub;
    const email = payload.email;

    return {
        email,
        principalId,
    };
}
