import React from 'react';
import { Animated } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { AnimatedHeader } from '../../components/AnimatedHeader';
import { ClubAvatar } from '../../components/ClubAvatar';
import { GoHomeErrorBoundary, withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { MEMBER_HEADER_HEIGHT, MEMBER_HEADER_SCROLL_HEIGHT } from '../../components/Profile/Dimensions';
import { ProfileHeader } from '../../components/Profile/Header';
import { IClubParams } from '../../redux/actions/navigation';
import { ClubDetails } from './ClubDetails';
import { ClubQueryWithPreviewAndInvalidation } from './ClubQueryWithPreview';
import { GetClubQueryType } from './Queries';

type OwnProps = {
    theme: Theme,
};

export type StateProps = {
    id: string,
    loading: boolean;
    club?: GetClubQueryType;
    preview?: GetClubQueryType;
};

type Props = OwnProps & StateProps;

const AnimatedAvatar = Animated.createAnimatedComponent(ClubAvatar);

class ClubBase extends AuditedScreen<Props> {
    constructor(props) {
        super(props, AuditScreenName.Club);
    }

    componentDidMount() {
        this.audit.submit({
            id: this.props.id
        });
    }

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
                    <Club id={club} />
                </ClubQueryWithPreviewAndInvalidation>
            </GoHomeErrorBoundary>
        )
    }
}

export const ClubScreen = withWhoopsErrorBoundary(
    withNavigation(ClubScreenBase));

