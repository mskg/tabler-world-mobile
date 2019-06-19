import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { WatchQueryFetchPolicy } from 'apollo-client';
import gql from 'graphql-tag';
import React from 'react';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { logger } from './logger';

const GetLastSyncQuery = (field) => gql`
    query LastSync {
        LastSync @client {
            ${field}
        }
    }
`;

export const MS_PER_MINUTE = 60000;
type FieldType = keyof typeof MaxTTL;

type CacheInvalidationProps = {
    field: FieldType,
    maxAge?: number,
    children: any,
}

export const MaxTTL = {
    members: 60 * 12,

    member: 60 * 12,
    club: 60 * 24,

    clubs: 60 * 24,
    areas: 60 * 24,
    associations: 60 * 24,

    utility: 60 * 4,
}

export function isRecordValid(type: keyof typeof MaxTTL, val: number): boolean {
    const age = MaxTTL[type] * MS_PER_MINUTE;
    const compareDate = Date.now() - age;

    if (val <= compareDate) {
        logger.debug(type, "*** REFETCHING DATA ***");
        return false;
    } else {
        logger.log(type, "*** DATA IS VALID ***",
            "age", age / MS_PER_MINUTE,
            "last fetch", new Date(val),
            "not older than", new Date(compareDate));

        return true;
    }
};

export class CacheInvalidation extends React.PureComponent<CacheInvalidationProps> {
    checkLastSync(client: ApolloClient<NormalizedCacheObject>): number {
        let data: any = null;
        const query = GetLastSyncQuery(this.props.field);

        try {
            data = client.readQuery({
                query
            });

            logger.log("Found cache for", this.props.field);
        }
        catch {
            data = {
                LastSync: {
                    [this.props.field]: 0,
                }
            }
        }

        return data.LastSync[this.props.field];
    }

    determine() {
        const client = cachedAolloClient();

        const syncDate = this.checkLastSync(client);
        const older = isRecordValid(this.props.field, syncDate);

        let policy: WatchQueryFetchPolicy | undefined;

        if (older) {
            policy = "cache-and-network";

            // defer update
            setTimeout(() =>
                client.writeData({
                    data: {
                        LastSync: {
                            __typename: 'LastSync',
                            [this.props.field]: Date.now()
                        }
                    },
                }));
        }

        return policy;
    }

    render() {
        return React.Children.map(this.props.children, child =>
            React.cloneElement(this.props.children, {
                ...this.props,
                fetchPolicy: this.determine(),
            }));
    }
};

export function withCacheInvalidation(field: FieldType, WrappedComponent: any, maxAge?: number) {
    return class extends React.PureComponent {
        render() {
            return (
                <CacheInvalidation field={field} maxAge={maxAge}>
                    <WrappedComponent {...this.props} />
                </CacheInvalidation>
            );
        }
    };
}
