/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: SearchDirectory
// ====================================================

export interface SearchDirectory_SearchDirectory_nodes_Area_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface SearchDirectory_SearchDirectory_nodes_Area {
  __typename: "Area";
  name: string;
  id: string;
  shortname: string;
  association: SearchDirectory_SearchDirectory_nodes_Area_association;
}

export interface SearchDirectory_SearchDirectory_nodes_Club_association {
  __typename: "Association";
  id: string;
  name: string;
  flag: string | null;
}

export interface SearchDirectory_SearchDirectory_nodes_Club_area {
  __typename: "Area";
  id: string;
  name: string;
}

export interface SearchDirectory_SearchDirectory_nodes_Club {
  __typename: "Club";
  id: string;
  name: string;
  logo: string | null;
  clubnumber: number;
  association: SearchDirectory_SearchDirectory_nodes_Club_association;
  area: SearchDirectory_SearchDirectory_nodes_Club_area;
}

export interface SearchDirectory_SearchDirectory_nodes_Association {
  __typename: "Association";
  name: string;
  id: string;
  logo: string | null;
  shortname: string;
  flag: string | null;
}

export type SearchDirectory_SearchDirectory_nodes = SearchDirectory_SearchDirectory_nodes_Area | SearchDirectory_SearchDirectory_nodes_Club | SearchDirectory_SearchDirectory_nodes_Association;

export interface SearchDirectory_SearchDirectory_pageInfo {
  __typename: "PageInfo";
  endCursor: string;
  hasNextPage: boolean;
}

export interface SearchDirectory_SearchDirectory {
  __typename: "SearchDirectoryConnection";
  nodes: SearchDirectory_SearchDirectory_nodes[];
  pageInfo: SearchDirectory_SearchDirectory_pageInfo;
}

export interface SearchDirectory {
  SearchDirectory: SearchDirectory_SearchDirectory;
}

export interface SearchDirectoryVariables {
  text: string;
  families?: string[] | null;
  after?: string | null;
}
