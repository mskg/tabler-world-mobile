import gql from 'graphql-tag';

export const GetAreasFilterQuery = gql`
    query AreasFilter {
        Areas {
            id
            area
            name
        }
    }
`;
