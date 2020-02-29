/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RoleType, CompanySector } from "./globalTypes";

// ====================================================
// GraphQL query operation: FavoriteMembers
// ====================================================

export interface FavoriteMembers_FavoriteMembers_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface FavoriteMembers_FavoriteMembers_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface FavoriteMembers_FavoriteMembers_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
  isocode: string;
}

export interface FavoriteMembers_FavoriteMembers_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
  type: RoleType;
}

export interface FavoriteMembers_FavoriteMembers_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: FavoriteMembers_FavoriteMembers_roles_ref;
}

export interface FavoriteMembers_FavoriteMembers_emails {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface FavoriteMembers_FavoriteMembers_phonenumbers {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface FavoriteMembers_FavoriteMembers_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface FavoriteMembers_FavoriteMembers_companies_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface FavoriteMembers_FavoriteMembers_companies {
  __typename: "Company";
  name: string;
  email: string | null;
  phone: string | null;
  function: string | null;
  sector: CompanySector | null;
  address: FavoriteMembers_FavoriteMembers_companies_address | null;
}

export interface FavoriteMembers_FavoriteMembers_educations_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface FavoriteMembers_FavoriteMembers_educations {
  __typename: "Education";
  school: string | null;
  education: string | null;
  address: FavoriteMembers_FavoriteMembers_educations_address | null;
}

export interface FavoriteMembers_FavoriteMembers_socialmedia {
  __typename: "SocialMedia";
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
}

export interface FavoriteMembers_FavoriteMembers {
  __typename: "Member";
  LastSync: number;
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: FavoriteMembers_FavoriteMembers_club;
  area: FavoriteMembers_FavoriteMembers_area;
  association: FavoriteMembers_FavoriteMembers_association;
  roles: FavoriteMembers_FavoriteMembers_roles[] | null;
  birthdate: any | null;
  datejoined: any | null;
  partner: string | null;
  availableForChat: boolean | null;
  emails: FavoriteMembers_FavoriteMembers_emails[] | null;
  phonenumbers: FavoriteMembers_FavoriteMembers_phonenumbers[] | null;
  rtemail: string | null;
  address: FavoriteMembers_FavoriteMembers_address | null;
  companies: FavoriteMembers_FavoriteMembers_companies[] | null;
  educations: FavoriteMembers_FavoriteMembers_educations[] | null;
  socialmedia: FavoriteMembers_FavoriteMembers_socialmedia | null;
  sharesLocation: boolean | null;
}

export interface FavoriteMembers {
  FavoriteMembers: FavoriteMembers_FavoriteMembers[];
}
