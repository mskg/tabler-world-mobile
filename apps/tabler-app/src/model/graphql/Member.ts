/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { RoleType, CompanySector } from "./globalTypes";

// ====================================================
// GraphQL query operation: Member
// ====================================================

export interface Member_Member_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface Member_Member_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface Member_Member_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface Member_Member_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
  type: RoleType;
}

export interface Member_Member_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: Member_Member_roles_ref;
}

export interface Member_Member_emails {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface Member_Member_phonenumbers {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface Member_Member_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface Member_Member_companies_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface Member_Member_companies {
  __typename: "Company";
  name: string;
  email: string | null;
  phone: string | null;
  function: string | null;
  sector: CompanySector | null;
  address: Member_Member_companies_address | null;
}

export interface Member_Member_educations_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface Member_Member_educations {
  __typename: "Education";
  school: string | null;
  education: string | null;
  address: Member_Member_educations_address | null;
}

export interface Member_Member_socialmedia {
  __typename: "SocialMedia";
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
}

export interface Member_Member {
  __typename: "Member";
  LastSync: number;
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: Member_Member_club;
  area: Member_Member_area;
  association: Member_Member_association;
  roles: Member_Member_roles[] | null;
  birthdate: any | null;
  datejoined: any | null;
  partner: string | null;
  availableForChat: boolean | null;
  emails: Member_Member_emails[] | null;
  phonenumbers: Member_Member_phonenumbers[] | null;
  rtemail: string | null;
  address: Member_Member_address | null;
  companies: Member_Member_companies[] | null;
  educations: Member_Member_educations[] | null;
  socialmedia: Member_Member_socialmedia | null;
  sharesLocation: boolean | null;
}

export interface Member {
  Member: Member_Member | null;
}

export interface MemberVariables {
  id: number;
}
