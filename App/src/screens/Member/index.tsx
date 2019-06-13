import { WatchQueryFetchPolicy } from 'apollo-client';
import React, { PureComponent, ReactElement } from 'react';
import { Query } from 'react-apollo';
import { Animated } from "react-native";
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { Audit } from "../../analytics/Audit";
import { IAuditor } from '../../analytics/Types';
import { AnimatedHeader } from '../../components/AnimatedHeader';
import { GoHomeErrorBoundary } from '../../components/ErrorBoundary';
import { MemberAvatar } from '../../components/MemberAvatar';
import { MEMBER_HEADER_HEIGHT, MEMBER_HEADER_SCROLL_HEIGHT } from '../../components/Profile/Dimensions';
import { ProfileHeader } from '../../components/Profile/Header';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from '../../helper/Logger';
import { addTablerLRU } from '../../redux/actions/history';
import { IProfileParams } from '../../redux/actions/navigation';
import { ActionsFab } from './ActionsFab';
import { Profile } from './Profile';
import { GetMemberQuery, GetMemberQueryType, MembersOverviewFragment } from './Queries';

const logger = new Logger(Categories.Screens.Member);

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    loading: boolean;

    id: number;
    member?: GetMemberQueryType;
    preview?: GetMemberQueryType;

    addTablerLRU: typeof addTablerLRU;
};

type Props = OwnProps & StateProps;

const AnimatedFab = Animated.createAnimatedComponent(ActionsFab);
const AnimatedAvatar = Animated.createAnimatedComponent(MemberAvatar);

export class MemberBase extends React.Component<Props> {
    audit: IAuditor;

    state = {
    };

    constructor(props) {
        super(props);
        this.audit = Audit.screen("Contact");
    }

    componentDidMount() {
        this.audit.submit();
        this.props.addTablerLRU(this.props.id);
    }

    _renderHeader = (scrollY: Animated.AnimatedAddition, distance: number) => {
        const memberProp = this.props.member || this.props.preview;
        const member = memberProp ? memberProp.Member : undefined;

        return (
            <ProfileHeader
                avatar={member ? <AnimatedAvatar member={member} /> : undefined}

                title={member ? member.firstname + " " + member.lastname : undefined}
                line1={member ? member.club.name : undefined}
                line2={member ? member.area.name + " " + member.association.name : undefined}

                fab={
                    member
                        ? <AnimatedFab member={member} />
                        : undefined
                }

                loading={member == null}
                distance={distance}
                scrollY={scrollY}
            />);
    }

    _renderContent = () => {
        const member = this.props.member || this.props.preview;

        return <Profile
            member={member != null ? member.Member : undefined}
            theme={this.props.theme}
            loading={this.props.loading}
        />
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

const Member = connect(null, { addTablerLRU })(withTheme(MemberBase));

export class MemberScreenBase extends React.Component<NavigationInjectedProps<IProfileParams>> {
    render() {
        const { tabler } = this.props.navigation.state.params as IProfileParams;

        return (
            <GoHomeErrorBoundary>
                <MemberQueryWithPreviewAndInvalidation id={tabler}>
                    <Member id={tabler} />
                </MemberQueryWithPreviewAndInvalidation>
            </GoHomeErrorBoundary>
        )
    }
}

class MemberQueryWithPreview extends PureComponent<{
    children: ReactElement<StateProps>,
    id: number,
    fetchPolicy?: WatchQueryFetchPolicy,
}> {
    render() {
        return (
            <Query<GetMemberQueryType>
                query={GetMemberQuery}
                variables={{
                    id: this.props.id
                }}
            >
                {({ client, loading, data }) => {
                    let preview = null;

                    logger.debug("render");
                    if (loading && (data == null || data.Member == null)) {
                        try {
                            preview = client.readFragment({
                                id: "Member:" + this.props.id,
                                fragment: MembersOverviewFragment
                            });

                            logger.log("found preview", preview);
                        }
                        catch (e) {
                            logger.error(e, "Failed to load preview");
                        }
                    }

                    return React.cloneElement(
                        this.props.children, {
                            loading: loading,
                            member: loading ? undefined : data,
                            preview: preview ? { Member: preview } : undefined,
                        });
                }}
            </Query >
        );
    }
}

const MemberQueryWithPreviewAndInvalidation = withCacheInvalidation("members", MemberQueryWithPreview);

export const MemberScreen = withNavigation(MemberScreenBase);
