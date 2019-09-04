/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import { ParameterInput, ParameterName } from "./globalTypes";

// ====================================================
// GraphQL query operation: GetParameters
// ====================================================

export interface GetParameters_getParameters {
  __typename: "Parameter";
  name: ParameterName;
  value: any;
}

export interface GetParameters {
  getParameters: GetParameters_getParameters[] | null;
}

export interface GetParametersVariables {
  info: ParameterInput;
}
