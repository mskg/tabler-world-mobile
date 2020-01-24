/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AssociationsAndRolesFilters
// ====================================================

export interface AssociationsAndRolesFilters_Me_association {
  __typename: "Association";
  id: string;
}

export interface AssociationsAndRolesFilters_Me {
  __typename: "Member";
  id: number;
  association: AssociationsAndRolesFilters_Me_association;
}

export interface AssociationsAndRolesFilters_Associations {
  __typename: "Association";
  id: string;
  name: string;
}

export interface AssociationsAndRolesFilters {
  Me: AssociationsAndRolesFilters_Me;
  Associations: AssociationsAndRolesFilters_Associations[] | null;
  Roles: string[] | null;
}
