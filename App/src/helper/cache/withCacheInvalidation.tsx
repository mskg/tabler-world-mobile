import { WatchQueryFetchPolicy } from 'apollo-client';
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

const MS_PER_MINUTE = 60000;
type FieldType = "clubs" | "members" | "areas" | "associations" | "utility";

type CacheInvalidationProps = {
    field: FieldType,
    maxAge?: number,
    children: any,
}

const DefaultAges = {
    members: 60 * 12,

    clubs: 60 * 24,
    areas: 60 * 24,
    associations: 60 * 24,

    utility: 60 * 4,
}

export class CacheInvalidation extends React.PureComponent<CacheInvalidationProps> {
    determine() {
        const client = cachedAolloClient();

        const query = GetLastSyncQuery(this.props.field);
        const age = (this.props.maxAge || DefaultAges[this.props.field] || 60*24) * MS_PER_MINUTE;

        let data: any = null;

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

        const syncDate = data.LastSync[this.props.field];
        const compareDate = Date.now() - age;

        const older = syncDate <= compareDate;
        let policy: WatchQueryFetchPolicy | undefined;

        if (older) {
            policy = "cache-and-network";
            logger.log("*** REFETCHING DATA ***", policy);

            client.writeData({
                data: {
                    LastSync: {
                        __typename: 'LastSync',
                        [this.props.field]: Date.now()
                    }
                },
            });
        } else {
            logger.log("*** DATA IS VALID ***",
                "age", age / MS_PER_MINUTE,
                "last fetch", new Date(syncDate),
                "not older than", new Date(compareDate));
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
