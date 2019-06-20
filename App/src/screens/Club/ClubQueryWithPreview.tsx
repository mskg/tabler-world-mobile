import React, { PureComponent, ReactElement } from 'react';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { isRecordValid } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { addSnack } from '../../redux/actions/snacks';
import { ClubOverviewFragment } from '../Structure/Queries';
import { StateProps } from './index';
import { logger } from "./logger";
import { GetClubQuery, GetClubQueryType, RolesFragment } from './Queries';

class ClubQueryWithPreview extends PureComponent<{
    children: ReactElement<StateProps>;
    id: string;
    fetchPolicy?: any;
    addSnack: typeof addSnack;
}> {
    render() {
        return (<Query<GetClubQueryType> query={GetClubQuery} variables={{
            id: this.props.id
        }} fetchPolicy={this.props.fetchPolicy}>
            {({ client, loading, data, error, refetch }) => {
                let preview: any = undefined;
                if (loading || error) {
                    let club: any = null;
                    let roles: any = null;
                    try {
                        club = client.readFragment({
                            id: 'Club:' + this.props.id,
                            fragment: ClubOverviewFragment,
                        });
                    }
                    catch (e) {
                        logger.log(e, "Could not read fragment ClubOverviewFragment");
                    }
                    try {
                        roles =
                            client.readFragment({
                                //@ts-ignore
                                id: 'Club:' + this.props.id,
                                fragmentName: "RoleDetails",
                                fragment: RolesFragment,
                            });
                    }
                    catch (e) {
                        logger.log(e, "Could not read fragment RoleDetails");
                    }
                    if (club != null) {
                        preview = {
                            Club: {
                                ...club,
                                ...roles || {},
                            }
                        };
                    }
                }

                if (error && !preview) {
                    throw error;
                }
                else if (error && preview) {
                    setTimeout(() => this.props.addSnack({
                        message: I18N.Whoops.partialData,
                    }));
                }

                if (data && data.Club != null) {
                    if (!isRecordValid("club", data.Club.LastSync)) {
                        setTimeout(() => refetch());
                    }
                }

                return React.cloneElement(this.props.children, {
                    loading: loading,
                    club: (loading || error) ? undefined : data,
                    preview: preview,
                });
            }}
        </Query>);
    }
}

export const ClubQueryWithPreviewAndInvalidation = connect(null, { addSnack })(ClubQueryWithPreview);
