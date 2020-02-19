import { IDataService } from '@mskg/tabler-world-rds-client';
import { AuthenticationError } from 'apollo-server-core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { isDebugMode } from '../debug/isDebugMode';
import { resolveDebugPrincipal } from '../debug/resolveDebugPrincipal';
import { lookupPrincipal } from '../sql/lookupPrincipal';
import { Family } from '../types/Family';
import { IPrincipal } from '../types/IPrincipal';
import { transportToPrincipal } from './transportToPrincipal';

const isNullOrEmpty = (str: any) => !str || str === '';

export async function resolvePrincipal(client: IDataService, event: APIGatewayProxyEvent): Promise<IPrincipal> {
    const authorizer = event.requestContext.authorizer;
    if (authorizer == null) {
        throw new AuthenticationError('Authorizer missing');
    }

    let resolvedPrincipal: any;

    if (isDebugMode(event)) {
        console.warn(`********* AUTHENTICATION DEBUG MODE *********`);
        resolvedPrincipal = resolveDebugPrincipal(event.headers);
    } else {
        const { version, area, club, association, id, email, family, roles } = transportToPrincipal(authorizer);

        resolvedPrincipal = {
            version,
            family,
            email,
            association,
            area,
            club,
            roles,
            id: parseInt(id as any, 10),
        } as IPrincipal;
    }

    if (
        typeof (resolvedPrincipal.email) !== 'string'

        || typeof (resolvedPrincipal.id) !== 'number'
        || isNaN(resolvedPrincipal.id)
        || resolvedPrincipal.id <= 0

        || typeof (resolvedPrincipal.association) !== 'string'
        || typeof (resolvedPrincipal.area) !== 'string'
        || typeof (resolvedPrincipal.club) !== 'string'

        || isNullOrEmpty(resolvedPrincipal.association)
        || isNullOrEmpty(resolvedPrincipal.area)
        || isNullOrEmpty(resolvedPrincipal.club)
    ) {
        throw new AuthenticationError('Authorizer: Context not complete');
    }

    // 1.2 checks
    if (resolvedPrincipal.version != null) {
        if (
            resolvedPrincipal.version !== '1.2'
            || resolvedPrincipal.family !== Family.RTI
        ) {
            throw new AuthenticationError('Authorizer: Context (v1.2) not complete');
        }
    }

    // we must read everything again, as the ids changed
    // this is only valid during migration as we receive old tokens
    if (resolvedPrincipal.version !== '1.2') {
        console.warn('new context generated for', resolvedPrincipal.email);
        return await lookupPrincipal(client, resolvedPrincipal.email);
    }

    return resolvedPrincipal as IPrincipal;
}
