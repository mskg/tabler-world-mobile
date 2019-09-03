import gql from 'graphql-tag';
import { NewsArticleFragment } from './NewsArticleFragment';

export const GetNewsQuery = gql`
    query TopNews {
        TopNews {
            ...NewsArticleFragment
        }
    }

    ${NewsArticleFragment}
`;
