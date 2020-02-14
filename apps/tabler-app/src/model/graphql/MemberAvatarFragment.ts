/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: MemberAvatarFragment
// ====================================================

export interface MemberAvatarFragment_club {
  __typename: "Club";
  id: string;
  name: string;
}

export interface MemberAvatarFragment_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface MemberAvatarFragment_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface MemberAvatarFragment {
  __typename: "Member";
  id: number;
  firstname: string | null;
  lastname: string | null;
  pic: string | null;
  club: MemberAvatarFragment_club;
  area: MemberAvatarFragment_area;
  association: MemberAvatarFragment_association;
}
