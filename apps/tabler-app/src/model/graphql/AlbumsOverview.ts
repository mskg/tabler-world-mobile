/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: AlbumsOverview
// ====================================================

export interface AlbumsOverview_Albums_pictures {
  __typename: "AlbumPicture";
  preview_1920: string;
  preview_60: string;
}

export interface AlbumsOverview_Albums {
  __typename: "Album";
  LastSync: number;
  id: number;
  name: string;
  description: string | null;
  pictures: AlbumsOverview_Albums_pictures[];
}

export interface AlbumsOverview {
  Albums: AlbumsOverview_Albums[];
}
