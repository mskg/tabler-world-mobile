/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RoleType, CompanySector } from "./globalTypes";

// ====================================================
// GraphQL query operation: OfflineMembers
// ====================================================

export interface OfflineMembers_OwnTable_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface OfflineMembers_OwnTable_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface OfflineMembers_OwnTable_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
  isocode: string;
}

export interface OfflineMembers_OwnTable_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
  type: RoleType;
}

export interface OfflineMembers_OwnTable_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: OfflineMembers_OwnTable_roles_ref;
}

export interface OfflineMembers_OwnTable_emails {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface OfflineMembers_OwnTable_phonenumbers {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface OfflineMembers_OwnTable_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface OfflineMembers_OwnTable_companies_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface OfflineMembers_OwnTable_companies {
  __typename: "Company";
  name: string;
  email: string | null;
  phone: string | null;
  function: string | null;
  sector: CompanySector | null;
  address: OfflineMembers_OwnTable_companies_address | null;
}

export interface OfflineMembers_OwnTable_educations_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface OfflineMembers_OwnTable_educations {
  __typename: "Education";
  school: string | null;
  education: string | null;
  address: OfflineMembers_OwnTable_educations_address | null;
}

export interface OfflineMembers_OwnTable_socialmedia {
  __typename: "SocialMedia";
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
}

export interface OfflineMembers_OwnTable {
  __typename: "Member";
  LastSync: number;
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: OfflineMembers_OwnTable_club;
  area: OfflineMembers_OwnTable_area;
  association: OfflineMembers_OwnTable_association;
  roles: OfflineMembers_OwnTable_roles[] | null;
  birthdate: any | null;
  datejoined: any | null;
  partner: string | null;
  availableForChat: boolean | null;
  emails: OfflineMembers_OwnTable_emails[] | null;
  phonenumbers: OfflineMembers_OwnTable_phonenumbers[] | null;
  rtemail: string | null;
  address: OfflineMembers_OwnTable_address | null;
  companies: OfflineMembers_OwnTable_companies[] | null;
  educations: OfflineMembers_OwnTable_educations[] | null;
  socialmedia: OfflineMembers_OwnTable_socialmedia | null;
  sharesLocation: boolean | null;
}

export interface OfflineMembers_FavoriteMembers_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface OfflineMembers_FavoriteMembers_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface OfflineMembers_FavoriteMembers_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
  isocode: string;
}

export interface OfflineMembers_FavoriteMembers_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
  type: RoleType;
}

export interface OfflineMembers_FavoriteMembers_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: OfflineMembers_FavoriteMembers_roles_ref;
}

export interface OfflineMembers_FavoriteMembers_emails {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface OfflineMembers_FavoriteMembers_phonenumbers {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface OfflineMembers_FavoriteMembers_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface OfflineMembers_FavoriteMembers_companies_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface OfflineMembers_FavoriteMembers_companies {
  __typename: "Company";
  name: string;
  email: string | null;
  phone: string | null;
  function: string | null;
  sector: CompanySector | null;
  address: OfflineMembers_FavoriteMembers_companies_address | null;
}

export interface OfflineMembers_FavoriteMembers_educations_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface OfflineMembers_FavoriteMembers_educations {
  __typename: "Education";
  school: string | null;
  education: string | null;
  address: OfflineMembers_FavoriteMembers_educations_address | null;
}

export interface OfflineMembers_FavoriteMembers_socialmedia {
  __typename: "SocialMedia";
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
}

export interface OfflineMembers_FavoriteMembers {
  __typename: "Member";
  LastSync: number;
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: OfflineMembers_FavoriteMembers_club;
  area: OfflineMembers_FavoriteMembers_area;
  association: OfflineMembers_FavoriteMembers_association;
  roles: OfflineMembers_FavoriteMembers_roles[] | null;
  birthdate: any | null;
  datejoined: any | null;
  partner: string | null;
  availableForChat: boolean | null;
  emails: OfflineMembers_FavoriteMembers_emails[] | null;
  phonenumbers: OfflineMembers_FavoriteMembers_phonenumbers[] | null;
  rtemail: string | null;
  address: OfflineMembers_FavoriteMembers_address | null;
  companies: OfflineMembers_FavoriteMembers_companies[] | null;
  educations: OfflineMembers_FavoriteMembers_educations[] | null;
  socialmedia: OfflineMembers_FavoriteMembers_socialmedia | null;
  sharesLocation: boolean | null;
}

export interface OfflineMembers {
  OwnTable: OfflineMembers_OwnTable[];
  FavoriteMembers: OfflineMembers_FavoriteMembers[];
}
