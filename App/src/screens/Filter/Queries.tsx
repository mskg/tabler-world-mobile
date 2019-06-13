import gql from 'graphql-tag';
export const AreasQuery = gql`
    query AreasQuery {
        Areas {
            id
            area
            name
        }
    }
`;
