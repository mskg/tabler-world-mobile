/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: Album
// ====================================================

export interface Album_Album_pictures {
  __typename: "AlbumPicture";
  id: number;
  preview_100: string;
  preview_1920: string;
}

export interface Album_Album {
  __typename: "Album";
  id: number;
  name: string;
  description: string | null;
  pictures: Album_Album_pictures[];
}

export interface Album {
  Album: Album_Album | null;
}

export interface AlbumVariables {
  id: number;
}
