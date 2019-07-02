import gql from 'graphql-tag';

export const GetAlbumsOverviewQuery = gql`
    query AlbumsOverview {
        Albums {
            LastSync @client

            id
            name
            description

            pictures (top: 5) {
                preview_1920
                preview_60
            }
        }
    }
`;
