import { sns } from './sns';
const PATTERN = /.*Endpoint (arn:aws:sns[^ ]+) already exists with the same [Tt]oken.*/;

// https://docs.aws.amazon.com/sns/latest/dg/mobile-platform-endpoint.html
export async function createEndpoint(app: string, token: string, userData: any): Promise<string> {
    try {
        const result = await sns.createPlatformEndpoint({
            PlatformApplicationArn: app,
            Token: token,
            CustomUserData: JSON.stringify(userData || {}),
        }).promise();

        return result.EndpointArn as string;
    } catch (e) {
        console.error('Could not create', app, token, userData, 'due to', e);

        const message = (e as Error).message || '';
        const matches = message.match(PATTERN);
        if (matches) {
            return matches[1];
        }

        throw e;
    }
}
