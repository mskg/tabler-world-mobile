import * as Contacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';
import * as React from 'react';
import { Alert } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { Action, FABGroup } from '../../components/FABGroup';
import { mapMemberToContact } from '../../helper/contacts/mapMemberToContact';
import { OpenLink } from '../../helper/OpenLink';
import { getParameterValue } from '../../helper/parameters/getParameterValue';
import { UrlParameters } from '../../helper/parameters/Urls';
import { I18N } from '../../i18n/translation';
import { Features, isFeatureEnabled } from '../../model/Features';
import { ParameterName } from '../../model/graphql/globalTypes';
import { Member_Member } from '../../model/graphql/Member';
import { IAppState } from '../../model/IAppState';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { HashMap } from '../../model/Maps';
import { toggleFavorite } from '../../redux/actions/filter';
import { startConversation } from '../../redux/actions/navigation';

type Props = {
    top?: number,

    user?: string,
    member: Member_Member
    theme: Theme,

    toggleFavorite: typeof toggleFavorite,
    startConversation: typeof startConversation,
    favorites: HashMap<boolean>,
    chatEnabled: boolean,
};

const testIsFavorite = (tabler: IMemberOverviewFragment, favorites: HashMap<boolean>) => {
    return tabler != null && favorites[tabler.id] === true;
};

class ActionsFabBase extends React.Component<Props> {
    state = {
        open: false,
    };

    _toggle = () => {
        this.props.toggleFavorite(this.props.member);
    }

    _handleWeb = async () => {
        const { member } = this.props;
        const urls = await getParameterValue<UrlParameters>(ParameterName.urls);

        OpenLink.url(
            urls.profile
                .replace('#id#', member.id.toString())
                .replace('#lang#', I18N.id),
        );
    }

    _chat = async () => {
        const { member } = this.props;
        this.props.startConversation(member.id, `${member.firstname} ${member.lastname}`);
    }

    _contact = async () => {
        const { status } = await Permissions.askAsync(Permissions.CONTACTS);

        if (status !== 'granted') {
            Alert.alert(I18N.Settings.contactpermissions);
        } else {
            const contact = await mapMemberToContact(this.props.member);
            Contacts.presentFormAsync(
                null,
                contact,
                {
                    shouldShowLinkedContacts: true,
                    allowsEditing: true,
                    allowsActions: true,
                },
            );
        }
    }

    render() {
        const isFav = testIsFavorite(this.props.member, this.props.favorites);

        // we cannot chat with ourself
        const canChat = this.props.member.availableForChat
            && this.props.user !== this.props.member.rtemail;

        return (
            // <Portal>
            <FABGroup
                areaStyle={{
                    alignItems: 'flex-end',
                    marginTop: this.props.top,
                }}

                open={this.state.open}
                icon={this.state.open ? 'close' : 'menu'}
                actions={[
                    {
                        icon: 'star',
                        label: isFav ? I18N.Member.Actions.remfav : I18N.Member.Actions.favadd,
                        onPress: this._toggle,
                        color: isFav ? this.props.theme.colors.accent : undefined,
                    },

                    isFeatureEnabled(Features.Chat) && canChat && this.props.chatEnabled
                        ? {
                            icon: 'chat',
                            label: I18N.Member.Actions.chat,
                            onPress: this._chat,
                        }
                        : undefined,

                    isFeatureEnabled(Features.SendToAdressbook)
                        ? {
                            icon: 'contacts',
                            label: I18N.Member.Actions.contact,
                            onPress: this._contact,
                        }
                        : undefined,

                    OpenLink.canOpenUrl()
                        ? {
                            icon: 'web',
                            label: I18N.Member.Actions.openweb,
                            onPress: this._handleWeb,
                        }
                        : undefined,
                    ,
                ].filter(Boolean) as Action[]}
                onStateChange={({ open }) => this.setState({ open })}
            />
            // </Portal>
        );
    }
}

export const ActionsFab = connect(
    (state: IAppState) => ({
        favorites: state.filter.member.favorites,
        chatEnabled: state.settings.notificationsOneToOneChat == null
            ? true : state.settings.notificationsOneToOneChat,
        user: state.auth.username,
    }),
    {
        toggleFavorite,
        startConversation,
    },
)(withTheme(ActionsFabBase));
