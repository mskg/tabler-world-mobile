import { ActionSheetProps, connectActionSheet } from '@expo/react-native-action-sheet';
import _ from 'lodash';
import React from 'react';
import { View } from "react-native";
import { Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { Audit } from "../../analytics/Audit";
import { IAuditor, logger } from '../../analytics/Types';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { Element } from '../../components/Profile/Element';
import { Section } from '../../components/Profile/Section';
import { SectionsPlaceholder } from '../../components/Profile/SectionPlaceholder';
import { formatAddress, formatCompany, formatEducation, formatRoutableAddress, showAddress } from '../../helper/addressHelpers';
import { collectEMails, collectPhones } from '../../helper/collect';
import { LinkingHelper } from '../../helper/LinkingHelper';
import { OpenLink } from '../../helper/OpenLink';
import { I18N } from '../../i18n/translation';
import { IAddress } from "../../model/IAddress";
import { IAppState } from '../../model/IAppState';
import { LinkType, openLinkWithApp, openLinkWithDefaultApp } from "./openLink";
import { Organization } from './Organization';
import { GetMemberQueryType_Member } from './Queries';
import { Roles } from './Roles';
import { Social } from './Social';

type State = {
    numbers: string[],
    emails: string[],
};

type OwnProps = {
    theme: Theme,

    member?: GetMemberQueryType_Member,
    loading: boolean,
};

type StateProps = {
    // toggleFavorite: typeof toggleFavorite,
    // favorites: HashMap<boolean>,

    messagingApp?: string,
    browserApp?: string,
    phoneApp?: string,
    emailApp?: string,
};

type Props = OwnProps & StateProps & ActionSheetProps;
type Sections = {
    icon: string,
    onPress?: () => void,

    secondIcon?: string,
    secondPress?: () => void,

    disableRipple?: boolean,
    highlight?: boolean,

    values: {
        field: string,
        text?: string | undefined | React.ReactNode,
        onPress?: () => void,
    }[],
}[];

@connectActionSheet
export class ProfileBase extends React.Component<Props, State> {
    audit: IAuditor;

    constructor(props: Props) {
        super(props);

        this.state = {
            numbers: collectPhones(props.member).map(n => n.value),
            emails: collectEMails(props.member).map(n => n.value),
        }

        this.audit = Audit.screen("Contact");
    }

    componentWillUpdate(nextProps: Props) {
        if (this.props.member !== nextProps.member) {
            this.setState({
                numbers: collectPhones(nextProps.member).map(n => n.value),
                emails: collectEMails(nextProps.member).map(n => n.value),
            });
        }
    }

    buildSingleAppMenu(title: string, reduced: Array<string | undefined>, protocol: LinkType, app: string) {
        if (reduced.length == 1) {
            openLinkWithApp(protocol, app, reduced[0] as string);
            return;
        }

        const filteredOptions = [...reduced, I18N.Member.Menu.cancel];

        this.props.showActionSheetWithOptions(
            {
                message: title,
                options: filteredOptions as string[],
                cancelButtonIndex: filteredOptions.length - 1,
            },

            buttonIndex => {
                if (buttonIndex != filteredOptions.length - 1) {
                    const text = filteredOptions[buttonIndex] as string;
                    openLinkWithApp(protocol, app, text);
                }
            }
        );
    }

    async buildMenu(title: string, selection: Array<string | undefined>, protocol: LinkType) {
        //@ts-ignore
        const original: string[] = _.uniq([...selection.filter(Boolean)]);

        //@ts-ignore
        const reduced: { text: string, action: () => void }[] = _.uniq([...selection.filter(Boolean)])
            .map(e => ({
                text: e,
                action: () => openLinkWithDefaultApp(protocol, e as string)
            }));

        switch (protocol) {
            case LinkType.EMail:
                reduced.push(
                    ...(await LinkingHelper.mailApps())
                        .filter(app => app != this.props.emailApp)
                        .map(app => ({
                            text: I18N.Settings.apps.mail(app) + " >",
                            action: () => this.buildSingleAppMenu(
                                I18N.Settings.apps.mail(app),
                                original,
                                LinkType.EMail,
                                app,
                            )
                        }))
                );
                break;

            case LinkType.Message:
                reduced.push(
                    ...(await LinkingHelper.messagingApps())
                        .filter(app => app != this.props.messagingApp)
                        .map(app => ({
                            text: I18N.Settings.apps.messaging(app) + " >",
                            action: () => this.buildSingleAppMenu(
                                I18N.Settings.apps.messaging(app),
                                original,
                                LinkType.Message,
                                app,
                            )
                        })));
                break;

            case LinkType.Phone:
                reduced.push(
                    ...(await LinkingHelper.callApps())
                        .filter(app => app != this.props.phoneApp)
                        .map(app => ({
                            text: I18N.Settings.apps.call(app) + " >",
                            action: () => this.buildSingleAppMenu(
                                I18N.Settings.apps.call(app),
                                original,
                                LinkType.Phone,
                                app,
                            )
                        })));
                break;

            case LinkType.Internet:
                reduced.push(
                    ...(await LinkingHelper.webApps())
                        .filter(app => app != this.props.browserApp)
                        .map(app => ({
                            text: I18N.Settings.apps.web(app) + " >",
                            action: () => this.buildSingleAppMenu(
                                I18N.Settings.apps.web(app),
                                original,
                                LinkType.Internet,
                                app,
                            )
                        })));
                break;
        }

        logger.debug("buildMenu", reduced);

        if (reduced.length > 1) {
            reduced.push({
                text: I18N.Member.Menu.cancel,
                action: () => { } // do nothing
            });

            this.props.showActionSheetWithOptions(
                {
                    message: title,
                    options: reduced.map(f => f.text),
                    cancelButtonIndex: reduced.length - 1,
                },

                buttonIndex => reduced[buttonIndex].action(),
            );
        }
        else if (reduced.length == 1) {
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
    };

    handleAddress = (address?: IAddress) => () => {
        showAddress(address);
    }

    checkCompanies() {
        if (this.props.member == null) return false;

        return (this.props.member.companies || [])
            .find(c => formatRoutableAddress(c.address) != null)
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

    render() {
        const { member } = this.props;
        if (this.props.member == null || this.props.loading) {
            return <View style={{ paddingTop: 32, paddingBottom: 32 }}>
                <Placeholder ready={false} previewComponent={
                    <>
                        <SectionsPlaceholder count={7} />
                    </>
                }>
                </Placeholder>
            </View>;
        }

        const sections: Sections = [
            {
                icon: "md-call",
                values: (collectPhones(member)).map(
                    p => ({
                        field: I18N.Member.telephone(p.type),
                        text: p.value,
                    })
                ),
                onPress: OpenLink.canCall() ? this._handleCall : undefined,

                secondIcon: "md-chatbubbles",
                secondPress: OpenLink.canSendMessage() ? this._handleSMS : undefined,
            },
            {
                icon: "md-mail",
                values: (collectEMails(member)).map(
                    p => ({
                        field: I18N.Member.email(p.type),
                        text: p.value,
                    })
                ),
                onPress: OpenLink.canEmail() ? this._handleEmail : undefined,
            },
            {
                icon: "md-person",
                values: [
                    {
                        text: this.checkSocial() ?
                            <Social social={member.socialmedia} theme={this.props.theme} />
                            : undefined
                    }
                ],
            },
            {
                icon: "md-book",
                disableRipple: true,
                values: [
                    {
                        field: I18N.Member.Fields.rtorg,
                        text: <Organization member={member} />,
                    }
                ]
            },
            {
                icon: "md-medal",
                disableRipple: true,
                values: [
                    {
                        field: I18N.Member.Fields.roles,
                        text: member.roles ? <Roles roles={member.roles} /> : undefined
                    }
                ]
            },
            {
                icon: "md-pin",
                highlight: OpenLink.canOpenUrl() && this.checkAddress(),
                values: [
                    {
                        field: I18N.Member.Fields.home,
                        text: formatAddress(member.address)
                    },
                ],
                onPress: OpenLink.canOpenUrl() ? this.handleAddress(member.address) : undefined,
            },
            {
                icon: "md-business",
                highlight: OpenLink.canOpenUrl() && this.checkCompanies(),
                disableRipple: true,
                values: (member.companies || []).map(
                    p => ({
                        field: I18N.Member.Fields.companies,
                        text: formatCompany(p),
                        onPress: OpenLink.canOpenUrl() ? this.handleAddress(p.address) : undefined,
                    })
                )
            },
            {
                icon: "md-school",
                values: (member.educations || []).map(
                    p => ({
                        field: I18N.Member.Fields.educations,
                        text: formatEducation(p),
                    })
                )
            },
            {
                icon: "md-heart",
                values: [
                    {
                        field: I18N.Member.Fields.partner,
                        text: member.partner
                    }
                ]
            },
            {
                icon: "md-gift",
                values: [
                    {
                        field: I18N.Member.Fields.birthday,
                        text: I18N.Member.Formats.date(member.birthdate),
                    }
                ]
            },
        ]
            .map(s => ({
                ...s,
                values: s.values.filter(v => v.text != null && v.text != ""),
            }))
            .filter(s => s.values.length > 0);

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
                                        key={i + "-" + j}
                                        field={v.field}
                                        onPress={v.onPress}
                                        text={v.text} />
                                ))
                            }
                        </Section>
                    ))
                }
            </View>);
    }
}

export const Profile = connect(
    (state: IAppState) => ({
        messagingApp: state.settings.messagingApp,
        browserApp: state.settings.browserApp,
        phoneApp: state.settings.phoneApp,
        emailApp: state.settings.emailApp,
    }), {
        // toggleFavorite,
    }
)(withTheme(ProfileBase));