import { ILogger } from '@mskg/tabler-world-common';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { logger } from '../subscriptions/publishToActiveSubscriptions';


type VersionMap<T> = {
    default: () => T,
    [version: string]: () => T,
};

type Args<T> = {
    context: {
        logger: ILogger,
        lambdaEvent?: APIGatewayProxyEvent,
    },

    mapVersion?: (version: string) => string,
    versions: VersionMap<T>,
};

export function byVersion<T>({ context: { lambdaEvent }, versions, mapVersion }: Args<T>): T {
    logger.log('Checking headers', lambdaEvent?.headers);

    if (!lambdaEvent || lambdaEvent.headers['x-client-name'] !== 'TABLER.APP') {
        logger.log('x-client-name not found');
        return versions.default();
    }

    const version = lambdaEvent.headers['x-client-version'];

    const mappedVersion = mapVersion ? mapVersion(version) : version;
    logger.log('x-client-version is', version, mappedVersion);

    return (versions[mappedVersion] || versions.default)();
}
