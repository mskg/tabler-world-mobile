import React from "react";
import { Theme } from "react-native-paper";
import { IMember } from "../../model/IMember";

export type MemberItemBaseProps = {
  theme: Theme;
  member: IMember;

  onPress: (member: IMember) => void;

  right?: (props: {
    size: number;
  }) => React.ReactNode;

  height?: number,
};
