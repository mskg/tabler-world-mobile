import React from 'react';
import { normalizeForSearch } from '../../helper/normalizeForSearch';
import { FavoriteButton } from '../FavoriteButton';
import { Highlighter } from './Highlighter';
import { InternalMemberListItem } from './InternalMemberListItem';
import { MemberItemBaseProps } from './MemberItemBaseProps';
import { MemberTitle } from './MemberTitle';

type Props = {
    search: string,
    text: string,
} & MemberItemBaseProps;

export class HighLightMemberListItem extends React.PureComponent<Props> {
    _right = ({ size }) => (
    <FavoriteButton
      theme={this.props.theme}
      member={this.props.member}
      size={size}
    />
  )

    render() {
      return (
      <InternalMemberListItem
        theme={this.props.theme}
        member={this.props.member}
        onPress={this.props.onPress}
        title={<MemberTitle member={this.props.member} />}
        subtitle={
          <Highlighter
            highlightStyle={{
                backgroundColor: this.props.theme.colors.accent,
                fontFamily: this.props.theme.fonts.medium,
            }}
            autoEscape={true}
            searchWords={this.props.search}
            textToHighlight={this.props.text}
            sanitize={normalizeForSearch}
          />}

        right={this.props.right || this._right}
      />
    );
  }
}
