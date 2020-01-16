/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AssociationsAndRolesFilters
// ====================================================

export interface AssociationsAndRolesFilters_Associations {
  __typename: "Association";
  id: string;
  name: string;
}

export interface AssociationsAndRolesFilters {
  Associations: AssociationsAndRolesFilters_Associations[] | null;
  Roles: string[] | null;
}
