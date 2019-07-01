/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { RoleType } from "./globalTypes";

// ====================================================
// GraphQL fragment: MemberDetailsFragment
// ====================================================

export interface MemberDetailsFragment_club {
  __typename: "Club";
  id: string;
  name: string;
  club: number;
}

export interface MemberDetailsFragment_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface MemberDetailsFragment_association {
  __typename: "Association";
  association: string;
  name: string;
}

export interface MemberDetailsFragment_roles_ref {
  __typename: "RoleRef";
  id: string;
  name: string;
  type: RoleType;
}

export interface MemberDetailsFragment_roles {
  __typename: "Role";
  name: string;
  level: string;
  group: string;
  ref: MemberDetailsFragment_roles_ref;
}

export interface MemberDetailsFragment_emails {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface MemberDetailsFragment_phonenumbers {
  __typename: "CommunicationElement";
  type: string;
  value: string;
}

export interface MemberDetailsFragment_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface MemberDetailsFragment_companies_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface MemberDetailsFragment_companies {
  __typename: "Company";
  name: string;
  email: string | null;
  phone: string | null;
  function: string | null;
  address: MemberDetailsFragment_companies_address | null;
}

export interface MemberDetailsFragment_educations_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
}

export interface MemberDetailsFragment_educations {
  __typename: "Education";
  school: string | null;
  education: string | null;
  address: MemberDetailsFragment_educations_address | null;
}

export interface MemberDetailsFragment_socialmedia {
  __typename: "SocialMedia";
  twitter: string | null;
  linkedin: string | null;
  facebook: string | null;
  instagram: string | null;
}

export interface MemberDetailsFragment {
  __typename: "Member";
  LastSync: number;
  id: number;
  pic: string | null;
  firstname: string | null;
  lastname: string | null;
  club: MemberDetailsFragment_club;
  area: MemberDetailsFragment_area;
  association: MemberDetailsFragment_association;
  roles: MemberDetailsFragment_roles[] | null;
  birthdate: any | null;
  partner: string | null;
  emails: MemberDetailsFragment_emails[] | null;
  phonenumbers: MemberDetailsFragment_phonenumbers[] | null;
  rtemail: string | null;
  address: MemberDetailsFragment_address | null;
  companies: MemberDetailsFragment_companies[] | null;
  educations: MemberDetailsFragment_educations[] | null;
  socialmedia: MemberDetailsFragment_socialmedia | null;
}
