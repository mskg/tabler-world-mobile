import Constants from 'expo-constants';
import * as Contacts from 'expo-contacts';
import * as React from 'react';
import { Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { FABGroup } from '../../components/FABGroup';
import { mapMemberToContact } from '../../helper/contacts/mapMemberToContact';
import { OpenLink } from '../../helper/OpenLink';
import { I18N } from '../../i18n/translation';
import { IAppState } from '../../model/IAppState';
import { IMember } from '../../model/IMember';
import { HashMap } from '../../model/Maps';
import { toggleFavorite } from '../../redux/actions/filter';

type Props = {
  top: number,

  member: IMember
  theme: Theme,

  toggleFavorite: typeof toggleFavorite,
  favorites: HashMap<boolean>,
}

const testIsFavorite = (tabler: IMember, favorites: HashMap<boolean>) => {
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
    const extra = Constants.manifest.extra;

    OpenLink.url(
      (extra != null ? extra["profile"] : null || "").replace("#id#", member.id)
    );
  }

  _contact = async () => {
    const contact = await mapMemberToContact(this.props.member);

    //@ts-ignore
    Contacts.presentFormAsync(null, contact);
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

          {
            icon: 'contacts',
            label: I18N.Member.Actions.contact,
            onPress: this._contact
          },

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
