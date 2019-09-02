import React from 'react';
import { Animated } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { AnimatedHeader } from '../../components/AnimatedHeader';
import { GoHomeErrorBoundary, withGoHomeErrorBoundary } from '../../components/ErrorBoundary';
import { MemberAvatar } from '../../components/MemberAvatar';
import { AvatarPopup } from '../../components/Profile/AvatarPopup';
import { MEMBER_HEADER_HEIGHT, MEMBER_HEADER_SCROLL_HEIGHT } from '../../components/Profile/Dimensions';
import { ProfileHeader } from '../../components/Profile/Header';
import createAnimatedComponentFrowardingRef from '../../helper/createAnimatedComponentFrowardingRef';
import { I18N } from '../../i18n/translation';
import { Member as MemberType } from '../../model/graphql/Member';
import { addTablerLRU } from '../../redux/actions/history';
import { IProfileParams } from '../../redux/actions/navigation';
import { ActionsFab } from './ActionsFab';
import { MemberQueryWithPreviewAndInvalidation } from './MemberQueryWithPreview';
import { Profile } from './Profile';

type OwnProps = {
    theme: Theme,
};

export type StateProps = {
    loading: boolean;

    id: number;
    member?: MemberType;
    preview?: MemberType;

    addTablerLRU: typeof addTablerLRU;
};

type Props = OwnProps & StateProps & NavigationInjectedProps<IProfileParams>;

const AnimatedFab = createAnimatedComponentFrowardingRef(ActionsFab);
const AnimatedAvatar = Animated.createAnimatedComponent(MemberAvatar);

class MemberBase extends AuditedScreen<Props> {
    state = {
    };

    constructor(props) {
        super(props, AuditScreenName.Member);
    }

    componentDidMount() {
        this.props.addTablerLRU(this.props.id);

        const memberProp = this.props.member || this.props.preview;
        const member = memberProp ? memberProp.Member : undefined;

        this.audit.submit({
            [AuditPropertyNames.Id]: this.props.id.toString(),
            [AuditPropertyNames.Club]: member ? member.club.name : '',
            [AuditPropertyNames.Association]: member ? member.association.name : '',
            [AuditPropertyNames.Area]: member ? member.area.name : '',
        });
    }

    _renderHeader = (scrollY: Animated.AnimatedAddition, distance: number) => {
        const memberProp = this.props.member || this.props.preview;
        const member = memberProp ? memberProp.Member : undefined;

        return (
            <ProfileHeader
                avatar={member ?
                    <AvatarPopup title={I18N.Image.Member} pic={member.pic}>
                        <AnimatedAvatar
                            member={member}
                            containerStyle={{
                                backgroundColor: this.props.theme.colors.background,
                                elevation: 3,
                            }}
                        />
                    </AvatarPopup>
                    : undefined}

                title={member ? member.firstname + ' ' + member.lastname : undefined}
                line1={member ? member.club.name : undefined}
                line2={member ? member.area.name + ' ' + member.association.name : undefined}

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

        // @ts-ignore
        return <Profile
            member={member != null ? member.Member : undefined}
            theme={this.props.theme}
            loading={this.props.loading}
        />;
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

const Member = connect(null, { addTablerLRU })(
    withTheme(
        MemberBase));

export class MemberScreenBase extends React.Component<NavigationInjectedProps<IProfileParams>> {
    render() {
        const { tabler } = this.props.navigation.state.params as IProfileParams;

        return (
            <GoHomeErrorBoundary>
                <MemberQueryWithPreviewAndInvalidation id={tabler}>
                    <Member id={tabler} />
                </MemberQueryWithPreviewAndInvalidation>
            </GoHomeErrorBoundary>
        );
    }
}

export const MemberScreen = withGoHomeErrorBoundary(
    withNavigation(MemberScreenBase));
