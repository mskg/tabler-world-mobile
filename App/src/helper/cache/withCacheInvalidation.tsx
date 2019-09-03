import { NormalizedCacheObject } from 'apollo-cache-inmemory';
import ApolloClient, { WatchQueryFetchPolicy } from 'apollo-client';
import gql from 'graphql-tag';
import React from 'react';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { ParameterName } from '../../model/graphql/globalTypes';
import { IAppState } from '../../model/IAppState';
import { getParameterValue } from '../parameters/getParameter';
import { MS_PER_MINUTE, TimeoutDefaults, TimeoutParameters } from '../parameters/Timeouts';
import { logger } from './logger';

const GetLastSyncQuery = (field) => gql`
    query LastSync {
        LastSync @client {
            ${field}
        }
    }
`;

type FieldType = keyof typeof MaxTTL;

type CacheInvalidationProps = {
    field: FieldType,
    maxAge?: number,
    children: any,

    offline: boolean,
};

let MaxTTL = TimeoutDefaults;

export function isRecordValid(type: keyof typeof MaxTTL, val: number): boolean {
    const age = MaxTTL[type];
    const compareDate = Date.now() - age;

    if (val <= compareDate) {
        logger.debug(type, '*** REFETCHING DATA ***');
        return false;
    }
    logger.log(
        type,
        '*** IS VALID ***',
        'age', age / MS_PER_MINUTE,
        'last fetch', new Date(val),
        'not older than', new Date(compareDate));

    return true;

}

export async function updateTimeouts() {
    const settings = await getParameterValue<TimeoutParameters>(ParameterName.timeouts);
    MaxTTL = settings;
}

class CacheInvalidationBase extends React.PureComponent<CacheInvalidationProps> {
    componentWillMount() {
        updateTimeouts();
    }

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

            // defer update
            setTimeout(() => {
                logger.debug(this.props.field, '*** SETTING NEW TIMESTAMP ***');
                client.writeData({
                    data: {
                        LastSync: {
                            __typename: 'LastSync',
                            [this.props.field]: Date.now(),
                        },
                    },
                });
            }, 100);
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

export function withCacheInvalidation(field: FieldType, WrappedComponent: any, maxAge?: number) {
    // tslint:disable-next-line: max-classes-per-file
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
