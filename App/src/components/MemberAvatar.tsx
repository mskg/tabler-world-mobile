import React from "react";
import { IWhoAmI } from "../model/IWhoAmI";
import { TextImageAvatar } from './TextImageAvatar';

type MemberAvatarProps = {
  member: {
    lastname: string | null,
    firstname: string | null,
    pic: string | null,
  };
  size?: number;
  background?: string;
  style?: any;
  containerStyle?: any;
};

export class MemberAvatar extends React.PureComponent<MemberAvatarProps> {
  render() {
    const { member, size, ...others } = this.props;

    return (
      <TextImageAvatar
        source={member.pic}
        size={size != null ? size : 38}
        label={(
          (member.firstname || "").substr(0, 1) + (member.lastname || "").substr(0, 1)
        ).toUpperCase()}
        {...others}
      />
    );
  }
}

type MeAvatarProps = {
  me: IWhoAmI;
  size?: number;
  background?: string;
};

export const MeAvatar = (props: MeAvatarProps) => {
  const { me, size, ...others } = props;
  return (
    <TextImageAvatar
      size={size != null ? size : 38}
      source={me.pic}
      label={(
        (me.firstname || "").substr(0, 1) +  (me.firstname || "").substr(0, 1)
      ).toUpperCase()}
      {...others}
    />
  );
};
