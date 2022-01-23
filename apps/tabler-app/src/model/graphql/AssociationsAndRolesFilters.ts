/* tslint:disable */
/* eslint-disable */
// @generated
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
  /**
   * Giving no id returns own family
   */
  Roles: string[] | null;
}

export interface AssociationsAndRolesFiltersVariables {
  family: string;
}
