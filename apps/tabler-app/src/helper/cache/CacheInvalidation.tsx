import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { WatchQueryFetchPolicy } from 'apollo-client';
import React from 'react';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { IAppState } from '../../model/IAppState';
import { GetLastSyncQuery } from '../../queries/GetLastSyncQuery';
import { FieldType } from './FieldType';
import { isRecordValid } from './isRecordValid';
import { logger } from './logger';
import { updateTimeouts } from './MaxTTL';

type CacheInvalidationProps = {
    field: FieldType,
    maxAge?: number,
    children: any,

    offline: boolean,
};

class CacheInvalidationBase extends React.PureComponent<CacheInvalidationProps> {
    /**
     * Update timeouts from parameters
     */
    componentWillMount() {
        updateTimeouts();
    }

    /**
     * Check for the last sync entry
     */
    checkLastSync(client: ApolloClient<NormalizedCacheObject>): number {
        let data: any = null;
        const query = GetLastSyncQuery(this.props.field);

        try {
            data = client.readQuery({
                query,
            });

            logger.log('Found cache for', this.props.field);
        } catch {
            data = {
                LastSync: {
                    [this.props.field]: 0,
                },
            };
        }

        return data.LastSync[this.props.field];
    }

    /**
     * Determine the fetchpolicy from the last sync entry.
     * If data is too old, reload it automatically.
     */
    determine(): WatchQueryFetchPolicy | undefined {
        if (this.props.offline) {
            logger.debug('*** OFFLINE ***');
            return 'cache-only';
        }

        const client = cachedAolloClient();

        const syncDate = this.checkLastSync(client);
        const valid = isRecordValid(this.props.field, syncDate);

        let policy: WatchQueryFetchPolicy | undefined;

        if (!valid) {
            policy = 'cache-and-network';

            // defer update to not produce a conflict
            setTimeout(
                () => {
                    logger.debug(this.props.field, '*** SETTING NEW TIMESTAMP ***');
                    client.writeData({
                        data: {
                            LastSync: {
                                __typename: 'LastSync',
                                [this.props.field]: Date.now(),
                            },
                        },
                    });
                },
                100,
            );
        }

        return policy;
    }

    render() {
        return React.Children.map(this.props.children, (child) =>
            React.cloneElement(child, {
                ...this.props,
                fetchPolicy: this.determine(),
            }));
    }
}

export const CacheInvalidation = connect((state: IAppState) => ({
    offline: state.connection.offline,
}))(CacheInvalidationBase);
