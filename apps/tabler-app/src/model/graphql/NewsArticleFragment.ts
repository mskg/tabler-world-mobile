/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: NewsArticleFragment
// ====================================================

export interface NewsArticleFragment_createdby {
  __typename: "Member";
  id: number;
  lastname: string | null;
  firstname: string | null;
  pic: string | null;
}

export interface NewsArticleFragment_album {
  __typename: "Album";
  id: number;
  name: string;
}

export interface NewsArticleFragment {
  __typename: "NewsArticle";
  id: number;
  name: string;
  description: string;
  createdby: NewsArticleFragment_createdby;
  album: NewsArticleFragment_album | null;
}
