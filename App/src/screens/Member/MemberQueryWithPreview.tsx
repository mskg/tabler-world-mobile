import { WatchQueryFetchPolicy } from 'apollo-client';
import React, { PureComponent, ReactElement } from 'react';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { isRecordValid } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { addSnack } from '../../redux/actions/snacks';
import { logger } from "./logger";
import { GetMemberQuery, GetMemberQueryType, MembersOverviewFragment } from './Queries';

class MemberQueryWithPreview extends PureComponent<{
    children: ReactElement;
    id: number;
    fetchPolicy?: WatchQueryFetchPolicy;
    addSnack: typeof addSnack;
}> {
    render() {
        return (<Query<GetMemberQueryType>
            query={GetMemberQuery}
            variables={{
                id: this.props.id
            }}
        >
            {({ client, loading, data, error, refetch }) => {
                let preview = null;

                if ((loading || error) && (data == null || data.Member == null)) {
                    try {
                        preview = client.readFragment({
                            id: "Member:" + this.props.id,
                            fragment: MembersOverviewFragment
                        });

                        logger.log("found preview", preview);
                    }
                    catch (e) {
                        logger.log(e, "Failed to read fragment");
                    }
                }

                if (error && !preview) {
                    throw error;
                }
                else if (error && preview) {
                    setTimeout(() => this.props.addSnack({
                        message: I18N.Whoops.partialData,
                        action: {
                            label: I18N.Whoops.refresh,
                            onPress: () => refetch({
                                id: this.props.id
                            }),
                        }
                    }));
                }

                if (data && data.Member != null) {
                    if (!isRecordValid("member", data.Member.LastSync)) {
                        setTimeout(() => refetch());
                    }
                }

                return React.cloneElement(this.props.children, {
                    loading: loading,
                    member: loading ? undefined : data,
                    preview: preview ? { Member: preview } : undefined,
                });
            }}
        </Query>);
    }
}

export const MemberQueryWithPreviewAndInvalidation =
    connect(null, { addSnack })(MemberQueryWithPreview);
