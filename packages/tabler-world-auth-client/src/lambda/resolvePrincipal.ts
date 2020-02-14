import { IDataService } from '@mskg/tabler-world-rds-client';
import { AuthenticationError } from 'apollo-server-core';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { isDebugMode } from '../debug/isDebugMode';
import { resolveDebugPrincipal } from '../debug/resolveDebugPrincipal';
import { lookupPrincipal } from '../sql/lookupPrincipal';
import { Family } from '../types/Family';
import { IPrincipal } from '../types/IPrincipal';

export async function resolvePrincipal(client: IDataService, event: APIGatewayProxyEvent): Promise<IPrincipal> {
    const authorizer = event.requestContext.authorizer;
    if (authorizer == null) {
        throw new AuthenticationError('Authorizer missing');
    }

    let resolvedPrincipal: IPrincipal;

    if (isDebugMode(event)) {
        console.warn(`********* AUTHENTICATION DEBUG MODE *********`);
        resolvedPrincipal = resolveDebugPrincipal(event.headers);
    } else {
        const { version, area, club, association, id, email, family } = authorizer;

        // tslint:disable: triple-equals
        if (area == null || area == '') { throw new AuthenticationError('Authorizer missing (area)'); }
        if (club == null || club == '') { throw new AuthenticationError('Authorizer missing (club)'); }
        if (association == null || association == '') { throw new AuthenticationError('Authorizer missing (association)'); }
        if (id == null || id == '') { throw new AuthenticationError('Authorizer missing (id)'); }
        if (email == null || email == '') { throw new AuthenticationError('Authorizer missing (email)'); }

        if (version === '1.2') {
            if (family == null || family == '') { throw new AuthenticationError('Authorizer missing (family)'); }
        }

        resolvedPrincipal = {
            version,
            family,
            email,
            association,
            area,
            club,
            id: parseInt(id, 10),
        };
    }

    if (
        typeof (resolvedPrincipal.association) != 'string'
        || typeof (resolvedPrincipal.email) != 'string'
        || typeof (resolvedPrincipal.area) != 'string'
        || typeof (resolvedPrincipal.club) != 'string'
        || typeof (resolvedPrincipal.id) != 'number'
        || resolvedPrincipal.id <= 0
        || resolvedPrincipal.area === ''
        || resolvedPrincipal.club === '') {
        throw new AuthenticationError('Context not complete');
    }

    // 1.2 checks
    if (resolvedPrincipal.version != null) {
        if (
            resolvedPrincipal.version !== '1.2'
            || resolvedPrincipal.family !== Family.RTI
        ) {
            throw new AuthenticationError('Context not complete');
        }
    }

    // we must read everything again, as the ids changed
    // this is only valid during migration as we receive old tokens
    if (resolvedPrincipal.version !== '1.2') {
        console.warn('new context generated for', resolvedPrincipal.email);
        return await lookupPrincipal(client, resolvedPrincipal.email);
    }

    return resolvedPrincipal;
}
