import React, { PureComponent, ReactElement } from 'react';
import { Query } from 'react-apollo';
import { Animated } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AnimatedHeader } from '../../components/AnimatedHeader';
import { ClubAvatar } from '../../components/ClubAvatar';
import { GoHomeErrorBoundary } from '../../components/ErrorBoundary';
import { MEMBER_HEADER_HEIGHT, MEMBER_HEADER_SCROLL_HEIGHT } from '../../components/Profile/Dimensions';
import { ProfileHeader } from '../../components/Profile/Header';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { IClubParams } from '../../redux/actions/navigation';
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

export const ClubScreen = withNavigation(ClubScreenBase);

class ClubQueryWithPreview extends PureComponent<{ children: ReactElement<StateProps>, id: string, fetchPolicy: any, }> {
    render() {
       return (
            <Query<GetClubQueryType>
                query={GetClubQuery}
                variables={{
                    id: this.props.id
                }}
                fetchPolicy={this.props.fetchPolicy}
            >
                {({ client, loading, data }) => {
                    let preview: any = undefined;

                    if (loading) {
                        let club: any = null;
                        let roles: any = null;

                        try {
                            club = client.readFragment({
                                id: 'Club:' + this.props.id,
                                fragment: ClubOverviewFragment,
                            });
                        } catch (e) {
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

                    return React.cloneElement(
                        this.props.children, {
                            loading: loading,
                            club: loading ? undefined : data,
                            preview: preview,
                        });
                }}
            </Query >
        );
    }
}
const ClubQueryWithPreviewAndInvalidation = withCacheInvalidation("clubs", ClubQueryWithPreview);
