import { ActionSheetProps, connectActionSheet } from '@expo/react-native-action-sheet';
import { uniq } from 'lodash';
import React from 'react';
import { Platform, View } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { logger } from '../../analytics/logger';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { Element } from '../../components/Profile/Element';
import { Section } from '../../components/Profile/Section';
import { SectionsPlaceholder } from '../../components/Profile/SectionPlaceholder';
import { formatAddress, formatCompany, formatEducation, formatRoutableAddress, showAddress } from '../../helper/addressHelpers';
import { collectEMails, collectPhones } from '../../helper/collect';
import { LinkingHelper } from '../../helper/LinkingHelper';
import { OpenLink } from '../../helper/OpenLink';
import { I18N } from '../../i18n/translation';
import { Features, isFeatureEnabled } from '../../model/Features';
import { Member_Member } from '../../model/graphql/Member';
import { IAddress } from '../../model/IAddress';
import { IAppState } from '../../model/IAppState';
import { startConversation } from '../../redux/actions/navigation';
import { LinkType, openLinkWithApp, openLinkWithDefaultApp } from './openLink';
import { Organization } from './Organization';
import { Roles } from './Roles';
import { Social } from './Social';

type State = {
    numbers: string[],
    emails: string[],
};

type OwnProps = {
    theme: Theme,

    member?: Member_Member | null,
    loading: boolean,
};

type StateProps = {
    messagingApp?: string,
    browserApp?: string,
    phoneApp?: string,
    emailApp?: string,
    nearBy?: boolean;
    offline: boolean;
    user?: string;
    chatEnabled: boolean;
    startConversation: typeof startConversation;
};

type Props = OwnProps & StateProps & ActionSheetProps;

type SectionValue = {
    field?: string,
    text?: string | undefined | React.ReactNode,
    onPress?: () => void,
};

type Section = {
    icon: string,
    onPress?: () => void,

    secondIcon?: string,
    secondPress?: () => void,

    disableRipple?: boolean,
    highlight?: boolean,

    values: SectionValue[],
};

type Sections = Section[];

class ProfileBase extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);

        this.state = {
            numbers: collectPhones(props.member).map((n) => n.value),
            emails: collectEMails(props.member).map((n) => n.value),
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (this.props.member !== prevProps.member) {
            this.setState({
                numbers: collectPhones(this.props.member).map((n) => n.value),
                emails: collectEMails(this.props.member).map((n) => n.value),
            });
        }
    }

    buildSingleAppMenu(title: string, reduced: string[] | undefined[], protocol: LinkType, app: string) {
        if (reduced.length === 1) {
            openLinkWithApp(protocol, app, reduced[0] as string);
            return;
        }

        const filteredOptions = [...reduced, I18N.Member.Menu.cancel];

        // https://github.com/expo/react-native-action-sheet/issues/112
        setTimeout(
            () => this.props.showActionSheetWithOptions(
                {
                    message: title,
                    options: filteredOptions as string[],
                    cancelButtonIndex: filteredOptions.length - 1,
                },

                (buttonIndex) => {
                    if (buttonIndex !== filteredOptions.length - 1) {
                        const text = filteredOptions[buttonIndex] as string;
                        openLinkWithApp(protocol, app, text);
                    }
                },
            ),
            Platform.OS === 'android' ? 400 : 0,
        );
    }

    async buildMenu(title: string, selection: (string | undefined)[], protocol: LinkType) {
        const original: string[] = uniq([...selection.filter(Boolean)]) as string[];

        const reduced: { text: string, action: () => void }[] = [...original]
            .map((e) => ({
                text: e,
                action: () => openLinkWithDefaultApp(protocol, e as string),
            }));

        switch (protocol) {
            case LinkType.EMail:
                reduced.push(
                    ...(await LinkingHelper.mailApps())
                        .filter((app) => app !== this.props.emailApp)
                        .map((app) => ({
                            text: `${I18N.Settings.apps.mail(app)} >`,
                            action: () => this.buildSingleAppMenu(
                                I18N.Settings.apps.mail(app),
                                original,
                                LinkType.EMail,
                                app,
                            ),
                        })),
                );
                break;

            case LinkType.Message:
                reduced.push(
                    ...(await LinkingHelper.messagingApps())
                        .filter((app) => app !== this.props.messagingApp)
                        .map((app) => ({
                            text: `${I18N.Settings.apps.messaging(app)} >`,
                            action: () => this.buildSingleAppMenu(
                                I18N.Settings.apps.messaging(app),
                                original,
                                LinkType.Message,
                                app,
                            ),
                        })));
                break;

            case LinkType.Phone:
                reduced.push(
                    ...(await LinkingHelper.callApps())
                        .filter((app) => app !== this.props.phoneApp)
                        .map((app) => ({
                            text: `${I18N.Settings.apps.call(app)} >`,
                            action: () => this.buildSingleAppMenu(
                                I18N.Settings.apps.call(app),
                                original,
                                LinkType.Phone,
                                app,
                            ),
                        })));
                break;

            case LinkType.Internet:
                reduced.push(
                    ...(await LinkingHelper.webApps())
                        .filter((app) => app !== this.props.browserApp)
                        .map((app) => ({
                            text: `${I18N.Settings.apps.web(app)} >`,
                            action: () => this.buildSingleAppMenu(
                                I18N.Settings.apps.web(app),
                                original,
                                LinkType.Internet,
                                app,
                            ),
                        })));
                break;
        }

        logger.debug('buildMenu', reduced);

        if (reduced.length > 1) {
            reduced.push({
                text: I18N.Member.Menu.cancel,
                // tslint:disable-next-line: no-empty
                action: () => { },
            });

            this.props.showActionSheetWithOptions(
                {
                    message: title,
                    options: reduced.map((f) => f.text),
                    cancelButtonIndex: reduced.length - 1,
                },

                (buttonIndex) => reduced[buttonIndex].action(),
            );
        } else if (reduced.length === 1) {
            reduced[0].action();
        }
    }

    _handleCall = () => {
        this.buildMenu(
            I18N.Member.Menu.tel,
            this.state.numbers,
            LinkType.Phone);
    }

    _handleSMS = () => {
        this.buildMenu(
            I18N.Member.Menu.sms,
            this.state.numbers,
            LinkType.Message);
    }

    _handleEmail = () => {
        this.buildMenu(
            I18N.Member.Menu.email,
            this.state.emails,
            LinkType.EMail);
    }

    _startChat = () => {
        if (!this.props.member) {
            return;
        }

        this.props.startConversation(
            this.props.member.id,
            `${this.props.member.firstname} ${this.props.member.lastname}`,
        );
    }

    handleAddress = (address?: IAddress | null) => () => {
        showAddress(address);
    }

    checkCompanies() {
        if (this.props.member == null) return false;

        return (this.props.member.companies || [])
            .find((c) => formatRoutableAddress(c.address) != null)
            != null;
    }

    checkAddress() {
        if (this.props.member == null) return false;

        return formatRoutableAddress(this.props.member.address) != null;
    }

    checkSocial() {
        if (this.props.member == null) return false;

        const social = this.props.member.socialmedia;
        if (social == null) { return false; }
        if (!social.facebook
            && !social.instagram
            && !social.linkedin
            && !social.twitter) { return false; }

        return true;
    }

    // tslint:disable-next-line: max-func-body-length
    render() {
        const { member } = this.props;

        if (member == null || this.props.loading) {
            return (
                <View style={{ paddingTop: 32, paddingBottom: 32 }}>
                    <Placeholder
                        ready={false}
                        previewComponent={
                            <>
                                <SectionsPlaceholder count={7} />
                            </>
                        }
                    />
                </View>
            );
        }

        const canChat = member.availableForChat && this.props.user !== member.rtemail
            && isFeatureEnabled(Features.Chat) && this.props.chatEnabled;

        const sections: Sections = [
            {
                icon: 'md-chatbubbles',
                values: [
                    {
                        field: I18N.Member.Fields.chat,
                        text: !canChat ? undefined : I18N.Member.chat(member.firstname),
                    }
                ],
                onPress: this._startChat,
            },
            {
                icon: 'md-call',
                values: (collectPhones(member)).map(
                    (p) => ({
                        field: I18N.Member.telephone(p.type),
                        text: p.value,
                    }),
                ),
                onPress: OpenLink.canCall() ? this._handleCall : undefined,

                secondIcon: 'md-chatbubbles',
                secondPress: OpenLink.canSendMessage() ? this._handleSMS : undefined,
            },
            {
                icon: 'md-mail',
                values: (collectEMails(member)).map(
                    (p) => ({
                        field: I18N.Member.email(p.type),
                        text: p.value,
                    }),
                ),
                onPress: OpenLink.canEmail() ? this._handleEmail : undefined,
            },
            {
                icon: 'md-person',
                values: [
                    {
                        text: this.checkSocial() ?
                            <Social social={member.socialmedia} theme={this.props.theme} />
                            : undefined,
                    },
                ],
            },
            {
                icon: 'md-book',
                disableRipple: true,
                values: [
                    {
                        field: I18N.Member.Fields.rtorg,
                        text: <Organization member={member} />,
                    },
                    {
                        field: I18N.Member.Fields.joined,
                        text: I18N.Member.Formats.membership(member.datejoined),
                    },
                ],
            },
            {
                icon: 'md-medal',
                disableRipple: true,
                values: [
                    {
                        field: I18N.Member.Fields.roles,
                        text: member.roles && member.roles.length > 0 ? <Roles roles={member.roles} /> : undefined,
                    },
                ],
            },
            {
                icon: 'md-pin',
                highlight: OpenLink.canOpenUrl() && this.checkAddress(),
                values: [
                    {
                        field: I18N.Member.Fields.home,
                        text: formatAddress(member.address),
                    },
                ],
                onPress: OpenLink.canOpenUrl() ? this.handleAddress(member.address) : undefined,
            },
            {
                icon: 'md-business',
                highlight: OpenLink.canOpenUrl() && this.checkCompanies(),
                disableRipple: true,
                values: (member.companies || []).map(
                    (p) => ({
                        field: I18N.Member.Fields.companies + (p.sector ? ` (${I18N.Search.sectorNames[p.sector]})` : ''),
                        text: formatCompany(p),
                        onPress: OpenLink.canOpenUrl() ? this.handleAddress(p.address) : undefined,
                    }),
                ),
            },
            {
                icon: 'md-school',
                values: (member.educations || []).map(
                    (p) => ({
                        field: I18N.Member.Fields.educations,
                        text: formatEducation(p),
                    }),
                ),
            },
            {
                icon: 'md-heart',
                values: [
                    {
                        field: I18N.Member.Fields.partner,
                        text: member.partner,
                    },
                ],
            },
            {
                icon: 'md-gift',
                values: [
                    {
                        field: I18N.Member.Fields.birthday,
                        text: I18N.Member.Formats.date(member.birthdate),
                    },
                ],
            },
            {
                icon: 'md-pin',
                values: [
                    {
                        field: I18N.NearbyMembers.title,
                        text:
                            this.props.nearBy
                                ? member.sharesLocation
                                    ? I18N.NearbyMembers.sharesLocation.true
                                    : I18N.NearbyMembers.sharesLocation.false
                                : undefined,
                    },
                ],
            },
        ]
            .map((s: Section) => ({
                ...s,
                values: s.values.filter((v) => v.text != null && v.text !== '') as SectionValue[],
            }))
            .filter((s: Section) => s.values.length > 0);

        return (
            <View style={{ paddingTop: 32, paddingBottom: 32 }}>
                {
                    sections.map((s, i) => (
                        <Section
                            key={i}
                            icon={s.icon}
                            theme={this.props.theme}
                            disableRipple={s.disableRipple}
                            onPress={s.onPress}
                            secondIcon={s.secondIcon}
                            secondPress={s.secondPress}
                            highlight={s.highlight}
                        >
                            {
                                s.values.map((v, j) => (
                                    <Element
                                        key={`${i}-${j}`}
                                        field={v.field || ''}
                                        onPress={v.onPress || (Platform.OS === 'android' ? s.onPress : undefined)}
                                        text={v.text}
                                    />
                                ))
                            }
                        </Section>
                    ))
                }
            </View>
        );
    }
}

export const Profile = connect(
    (state: IAppState) => ({
        messagingApp: state.settings.messagingApp,
        browserApp: state.settings.browserApp,
        phoneApp: state.settings.phoneApp,
        emailApp: state.settings.emailApp,
        nearBy: state.settings.nearbyMembers,
        offline: state.connection.offline,

        chatEnabled: state.settings.notificationsOneToOneChat == null
            ? true : state.settings.notificationsOneToOneChat,
        user: state.auth.username,
    }),
    {
        startConversation,
    },
)(
    withTheme(connectActionSheet(ProfileBase)));
