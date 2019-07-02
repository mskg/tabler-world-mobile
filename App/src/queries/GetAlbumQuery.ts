import gql from 'graphql-tag';

export const GetAlbumQuery = gql`
    query Album ($id: Int!) {
        Album (id: $id) {
            id
            name
            description

            pictures {
                id
                preview_100
                preview_1920
            }
        }
    }
`;
