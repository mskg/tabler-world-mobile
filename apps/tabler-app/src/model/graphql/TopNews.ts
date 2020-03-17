/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: TopNews
// ====================================================

export interface TopNews_TopNews_createdby {
  __typename: "Member";
  id: number;
  lastname: string | null;
  firstname: string | null;
  pic: string | null;
}

export interface TopNews_TopNews_album {
  __typename: "Album";
  id: number;
  name: string;
}

export interface TopNews_TopNews {
  __typename: "NewsArticle";
  id: number;
  name: string;
  description: string;
  createdby: TopNews_TopNews_createdby;
  album: TopNews_TopNews_album | null;
}

export interface TopNews {
  TopNews: TopNews_TopNews[] | null;
}
