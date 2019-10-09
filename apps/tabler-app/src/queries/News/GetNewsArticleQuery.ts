import gql from 'graphql-tag';
import { NewsArticleFragment } from './NewsArticleFragment';


export const GetNewsArticleQuery = gql`
    query NewsArticle ($id: Int!) {
        NewsArticle (id: $id) {
            LastSync @client

            ...NewsArticleFragment
        }
    }

    ${NewsArticleFragment}
`;
