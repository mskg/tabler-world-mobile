import { WatchQueryFetchPolicy } from 'apollo-client';
import React, { PureComponent } from 'react';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { isRecordValid } from '../../helper/cache/isRecordValid';
import { I18N } from '../../i18n/translation';
import { Member } from '../../model/graphql/Member';
import { MemberOverviewFragment as MemberOverviewFragmentType } from '../../model/graphql/MemberOverviewFragment';
import { GetMemberQuery } from '../../queries/Member/GetMemberQuery';
import { MemberOverviewFragment } from '../../queries/Member/MemberOverviewFragment';
import { addSnack } from '../../redux/actions/snacks';
import { logger } from './logger';

class MemberQueryWithPreview extends PureComponent<{
    children: React.ReactElement<any>;
    id: number;
    fetchPolicy?: WatchQueryFetchPolicy;
    addSnack: typeof addSnack;
}> {
    render() {
        return (<Query<Member>
            query={GetMemberQuery}
            variables={{
                id: this.props.id,
            }}
        >
            {({ client, loading, data, error, refetch }) => {
                let preview: MemberOverviewFragmentType | null = null;

                if ((loading || error) && (data == null || data.Member == null)) {
                    try {
                        preview = client.readFragment<MemberOverviewFragmentType>({
                            id: 'Member:' + this.props.id,
                            fragment: MemberOverviewFragment,
                        });

                        logger.log('found preview', preview);
                    } catch (e) {
                        logger.log(e, 'Failed to read fragment');
                    }
                }

                if (error && !preview) {
                    throw error;
                } else if (error && preview) {
                    setTimeout(() => this.props.addSnack({
                        message: I18N.Component_Whoops.partialData,
                        action: {
                            label: I18N.Component_Whoops.refresh,
                            onPress: () => refetch({
                                id: this.props.id,
                            }),
                        },
                    }));
                }

                if (data && data.Member != null) {
                    if (!isRecordValid('member', data.Member.LastSync)) {
                        setTimeout(() => refetch());
                    }
                }

                return React.cloneElement(this.props.children, {
                    loading,
                    member: loading ? undefined : data,
                    preview: preview ? { Member: preview } : undefined,
                });
            }}
        </Query>
        );
    }
}

// tslint:disable-next-line: export-name
export const MemberQueryWithPreviewAndInvalidation =
    connect(null, { addSnack })(MemberQueryWithPreview);
