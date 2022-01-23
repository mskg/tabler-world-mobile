/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import { RoleType, CompanySector } from "./globalTypes";

// ====================================================
// GraphQL fragment: MemberDetailsFragment
// ====================================================

export interface MemberDetailsFragment_family {
  __typename: "Family";
  id: string;
  icon: string | null;
  name: string;
  shortname: string;
}

export interface MemberDetailsFragment_club {
  __typename: "Club";
  id: string;
  name: string;
  clubnumber: number;
}

export interface MemberDetailsFragment_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface MemberDetailsFragment_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
  isocode: string;
}

export interface MemberDetailsFragment_roles_ref {
  __typename: "RoleRef";
  id: string;
  shortname: string;
  type: RoleType;
}

export interface MemberDetailsFragment_roles {
  __typename: "Role";
  name: string;
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

export interface MemberDetailsFragment_address_location {
  __typename: "GeoPoint";
  longitude: number;
  latitude: number;
}

export interface MemberDetailsFragment_address {
  __typename: "Address";
  postal_code: string | null;
  city: string | null;
  country: string | null;
  street1: string | null;
  street2: string | null;
  location: MemberDetailsFragment_address_location | null;
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
  sector: CompanySector | null;
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
  family: MemberDetailsFragment_family;
  club: MemberDetailsFragment_club;
  area: MemberDetailsFragment_area;
  association: MemberDetailsFragment_association;
  roles: MemberDetailsFragment_roles[] | null;
  birthdate: any | null;
  datejoined: any | null;
  partner: string | null;
  availableForChat: boolean | null;
  emails: MemberDetailsFragment_emails[] | null;
  phonenumbers: MemberDetailsFragment_phonenumbers[] | null;
  rtemail: string | null;
  address: MemberDetailsFragment_address | null;
  companies: MemberDetailsFragment_companies[] | null;
  educations: MemberDetailsFragment_educations[] | null;
  socialmedia: MemberDetailsFragment_socialmedia | null;
  sharesLocation: boolean | null;
}
