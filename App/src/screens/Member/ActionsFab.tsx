import * as Contacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';
import * as React from 'react';
import { Alert } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { FABGroup } from '../../components/FABGroup';
import { getConfigValue } from '../../helper/Configuration';
import { mapMemberToContact } from '../../helper/contacts/mapMemberToContact';
import { OpenLink } from '../../helper/OpenLink';
import { I18N } from '../../i18n/translation';
import { Features, isFeatureEnabled } from '../../model/Features';
import { Member_Member } from '../../model/graphql/Member';
import { IAppState } from '../../model/IAppState';
import { IMemberOverviewFragment } from "../../model/IMemberOverviewFragment";
import { HashMap } from '../../model/Maps';
import { toggleFavorite } from '../../redux/actions/filter';

type Props = {
  top: number,

  member: Member_Member
  theme: Theme,

  toggleFavorite: typeof toggleFavorite,
  favorites: HashMap<boolean>,
}

const testIsFavorite = (tabler: IMemberOverviewFragment, favorites: HashMap<boolean>) => {
  return tabler != null && favorites[tabler.id] === true;
}

class ActionsFabBase extends React.Component<Props> {
  state = {
    open: false,
  };

  _toggle = () => {
    this.props.toggleFavorite(this.props.member);
  }

  _handleWeb = () => {
    const { member } = this.props;
    const profile = getConfigValue("profile");

    OpenLink.url(
      profile.replace("#id#", member.id.toString())
    );
  }

  _contact = async () => {
    let { status } = await Permissions.askAsync(Permissions.CONTACTS);

    if (status !== 'granted') {
      Alert.alert(I18N.Settings.contactpermissions)
    }
    else {
      const contact = await mapMemberToContact(this.props.member);
      //@ts-ignore
      Contacts.presentFormAsync(null, contact, {
        shouldShowLinkedContacts: true,
        allowsEditing: true,
        allowsActions: true,
      });
    }
  }

  render() {
    const isFav = testIsFavorite(this.props.member, this.props.favorites);

    return (
      // <Portal>
      <FABGroup
        areaStyle={{
          alignItems: "flex-end",
          marginTop: this.props.top
        }}

        open={this.state.open}
        icon={'menu'}
        actions={[
          {
            icon: 'star',
            label: isFav ? I18N.Member.Actions.remfav : I18N.Member.Actions.favadd,
            onPress: this._toggle,
            color: isFav ? this.props.theme.colors.accent : undefined
          },

          isFeatureEnabled(Features.SendToAdressbook)
            ? {
              icon: 'contacts',
              label: I18N.Member.Actions.contact,
              onPress: this._contact
            }
            : undefined,

          OpenLink.canOpenUrl() ?
            {
              icon: 'web',
              label: I18N.Member.Actions.openweb,
              onPress: this._handleWeb
            } : undefined,
        ].filter(Boolean)}
        onStateChange={({ open }) => this.setState({ open })}
      />
      // </Portal>
    );
  }
}

export const ActionsFab = connect(
  (state: IAppState) => ({ favorites: state.filter.member.favorites }),
  {
    toggleFavorite,
  }
)(withTheme(ActionsFabBase));
