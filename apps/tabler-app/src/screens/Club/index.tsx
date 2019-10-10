import React from 'react';
import { Animated } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { AnimatedHeader } from '../../components/AnimatedHeader';
import { ClubAvatar } from '../../components/ClubAvatar';
import { withWhoopsErrorBoundary, withGoHomeErrorBoundary } from '../../components/ErrorBoundary';
import { AvatarPopup } from '../../components/Profile/AvatarPopup';
import { MEMBER_HEADER_HEIGHT, MEMBER_HEADER_SCROLL_HEIGHT } from '../../components/Profile/Dimensions';
import { ProfileHeader } from '../../components/Profile/Header';
import { I18N } from '../../i18n/translation';
import { Club as ClubType } from '../../model/graphql/Club';
import { IClubParams } from '../../redux/actions/navigation';
import { ClubDetails } from './ClubDetails';
import { ClubQueryWithPreviewAndInvalidation } from './ClubQueryWithPreview';

type OwnProps = {
    theme: Theme,
};

export type StateProps = {
    id: string,
    loading?: boolean;
    club?: ClubType;
    preview?: ClubType;
};

type Props = OwnProps & StateProps;

const AnimatedAvatar = Animated.createAnimatedComponent(ClubAvatar);

class ClubBase extends AuditedScreen<Props> {
    constructor(props) {
        super(props, AuditScreenName.Club);
    }

    componentDidMount() {
        const clubProp = this.props.club || this.props.preview;
        const club = clubProp ? clubProp.Club : undefined;

        this.audit.submit({
            [AuditPropertyNames.Id]: this.props.id,
            [AuditPropertyNames.Club]: club ? club.name : '',
            [AuditPropertyNames.Association]: club ? club.association.name : '',
            [AuditPropertyNames.Area]: club ? club.area.name : '',
        });
    }

    _renderHeader = (scrollY: Animated.AnimatedAddition, distance: number) => {
        const clubProp = this.props.club || this.props.preview;
        const club = clubProp ? clubProp.Club : undefined;

        return (
            <ProfileHeader
                avatar={club ?
                    <AvatarPopup title={I18N.Image.Club} pic={club.logo}>
                        <AnimatedAvatar
                            label={club.club}
                            source={club.logo}
                        />
                    </AvatarPopup>
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

        return <ClubDetails club={club} loading={this.props.loading || false} />;
    }

    render() {
        return (
            <AnimatedHeader
                minHeight={MEMBER_HEADER_HEIGHT - MEMBER_HEADER_SCROLL_HEIGHT}
                height={MEMBER_HEADER_HEIGHT}
                renderContent={this._renderContent}
                renderHeader={this._renderHeader}
            />
        );
    }
}


const Club = withTheme(ClubBase);

// tslint:disable-next-line: max-classes-per-file
export class ClubScreenBase extends React.Component<NavigationInjectedProps<IClubParams>> {
    render() {
        const { club } = this.props.navigation.state.params as IClubParams;

        return (
            <ClubQueryWithPreviewAndInvalidation id={club}>
                <Club id={club} />
            </ClubQueryWithPreviewAndInvalidation>
        );
    }
}

export const ClubScreen = withGoHomeErrorBoundary(
    withNavigation(ClubScreenBase));

