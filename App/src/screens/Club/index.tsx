import React, { PureComponent, ReactElement } from 'react';
import { Query } from 'react-apollo';
import { Animated } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AnimatedHeader } from '../../components/AnimatedHeader';
import { ClubAvatar } from '../../components/ClubAvatar';
import { GoHomeErrorBoundary, withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { MEMBER_HEADER_HEIGHT, MEMBER_HEADER_SCROLL_HEIGHT } from '../../components/Profile/Dimensions';
import { ProfileHeader } from '../../components/Profile/Header';
import { isRecordValid } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { IClubParams } from '../../redux/actions/navigation';
import { addSnack } from '../../redux/actions/snacks';
import { ClubOverviewFragment } from '../Structure/Queries';
import { ClubDetails } from './ClubDetails';
import { GetClubQuery, GetClubQueryType, RolesFragment } from './Queries';

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    loading: boolean;
    club?: GetClubQueryType;
    preview?: GetClubQueryType;
};

type Props = OwnProps & StateProps;

const AnimatedAvatar = Animated.createAnimatedComponent(ClubAvatar);
const logger = new Logger(Categories.Screens.Club);

class ClubBase extends React.Component<Props> {
    _renderHeader = (scrollY: Animated.AnimatedAddition, distance: number) => {
        const clubProp = this.props.club || this.props.preview;
        const club = clubProp ? clubProp.Club : undefined;

        return (
            <ProfileHeader
                avatar={club
                    ? <AnimatedAvatar
                        label={club.club}
                        source={club.logo}
                    />
                    : undefined
                }

                loading={club == null}
                title={club ? club.name : undefined}
                line1={club ? club.association.name : undefined}
                line2={club ? club.area.name : undefined}

                distance={distance}
                scrollY={scrollY}
            />
        );
    }

    _renderContent = () => {
        const clubProp = this.props.club || this.props.preview;
        const club = clubProp ? clubProp.Club : undefined;

        return <ClubDetails club={club} loading={this.props.loading} />;
    }

    render() {
        return (
            <AnimatedHeader
                minHeight={MEMBER_HEADER_HEIGHT - MEMBER_HEADER_SCROLL_HEIGHT}
                height={MEMBER_HEADER_HEIGHT}
                renderContent={this._renderContent}
                renderHeader={this._renderHeader} />
        );
    }
}


const Club = withTheme(ClubBase);

export class ClubScreenBase extends React.Component<NavigationInjectedProps<IClubParams>> {
    render() {
        const { club } = this.props.navigation.state.params as IClubParams;

        return (
            <GoHomeErrorBoundary>
                <ClubQueryWithPreviewAndInvalidation id={club}>
                    <Club />
                </ClubQueryWithPreviewAndInvalidation>
            </GoHomeErrorBoundary>
        )
    }
}

export const ClubScreen = withWhoopsErrorBoundary(withNavigation(ClubScreenBase));

class ClubQueryWithPreview extends PureComponent<{
    children: ReactElement<StateProps>,
    id: string,
    fetchPolicy: any,
    addSnack: typeof addSnack,
}> {
    render() {
        return (
            <Query<GetClubQueryType>
                query={GetClubQuery}
                variables={{
                    id: this.props.id
                }}
                fetchPolicy={this.props.fetchPolicy}
            >
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
                        } catch (e) {
                            logger.error(e, "Could not read fragment ClubOverviewFragment");
                        }

                        try {
                            roles =
                                client.readFragment({
                                    //@ts-ignore
                                    id: 'Club:' + this.props.id,
                                    fragmentName: "RoleDetails",
                                    fragment: RolesFragment,
                                });
                        } catch (e) {
                            logger.error(e, "Could not read fragment RoleDetails");
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

                    if (error && !preview) { throw error; }
                    else if (error && preview) {
                        setTimeout(() =>
                            this.props.addSnack({
                                message: I18N.Whoops.partialData,
                            }));
                    }

                    if (data && data.Club != null) {
                        if (!isRecordValid("club", data.Club.LastSync)) {
                            setTimeout(() => refetch());
                        }
                    }

                    return React.cloneElement(
                        this.props.children, {
                            loading: loading,
                            club: (loading || error) ? undefined : data,
                            preview: preview,
                        });
                }}
            </Query >
        );
    }
}

const ClubQueryWithPreviewAndInvalidation = connect(
        null, { addSnack }
    )(ClubQueryWithPreview);