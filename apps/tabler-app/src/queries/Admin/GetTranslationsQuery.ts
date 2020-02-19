import gql from 'graphql-tag';

export const GetTranslationsQuery = gql`
    query Translations ($id: String!) {
        Translations (language: $id)
    }
`;
