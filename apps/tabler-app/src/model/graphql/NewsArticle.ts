/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: NewsArticle
// ====================================================

export interface NewsArticle_NewsArticle_createdby {
  __typename: "Member";
  id: number;
  lastname: string | null;
  firstname: string | null;
  pic: string | null;
}

export interface NewsArticle_NewsArticle_album {
  __typename: "Album";
  id: number;
  name: string;
}

export interface NewsArticle_NewsArticle {
  __typename: "NewsArticle";
  LastSync: number;
  id: number;
  name: string;
  description: string;
  createdby: NewsArticle_NewsArticle_createdby;
  album: NewsArticle_NewsArticle_album | null;
}

export interface NewsArticle {
  NewsArticle: NewsArticle_NewsArticle | null;
}

export interface NewsArticleVariables {
  id: number;
}
