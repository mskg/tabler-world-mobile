import gql from 'graphql-tag';
export const NewsArticleFragment = gql`
    fragment NewsArticleFragment on NewsArticle {
        id
        name
        description

        createdby {
            id
            lastname
            firstname
            pic
        }

        album {
            id
            name
        }
    }
`;
