import React, { PureComponent, ReactElement } from 'react';
import { Query } from 'react-apollo';
import { connect } from 'react-redux';
import { isRecordValid } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { Club } from '../../model/graphql/Club';
import { ClubOverviewFragment as ClubOverviewFragmentType } from '../../model/graphql/ClubOverviewFragment';
import { RolesFragment as RolesFragmentType } from '../../model/graphql/RolesFragment';
import { ClubOverviewFragment } from "../../queries/ClubOverviewFragment";
import { GetClubQuery } from '../../queries/GetClubQuery';
import { RolesFragment } from "../../queries/RolesFragment";
import { addSnack } from '../../redux/actions/snacks';
import { StateProps } from './index';
import { logger } from "./logger";


class ClubQueryWithPreview extends PureComponent<{
    children: ReactElement<StateProps>;
    id: string;
    fetchPolicy?: any;
    addSnack: typeof addSnack;
}> {
    render() {
        return (<Query<Club> query={GetClubQuery} variables={{
            id: this.props.id
        }} fetchPolicy={this.props.fetchPolicy}>
            {({ client, loading, data, error, refetch }) => {
                let preview: any = undefined;
                if (loading || error) {
                    let club: ClubOverviewFragmentType | null = null;
                    let roles: RolesFragmentType | null = null;

                    try {
                        club = client.readFragment<ClubOverviewFragmentType>({
                            id: 'Club:' + this.props.id,
                            fragment: ClubOverviewFragment,
                        });
                    }
                    catch (e) {
                        logger.log(e, "Could not read fragment ClubOverviewFragment");
                    }
                    try {
                        roles =
                            client.readFragment<RolesFragmentType>({
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
                        action: {
                            label: I18N.Whoops.refresh,
                            onPress: () => refetch({
                                id: this.props.id
                            }),
                        }
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
