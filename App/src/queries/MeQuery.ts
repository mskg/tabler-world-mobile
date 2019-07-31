import gql from 'graphql-tag';
import { MeFragment } from './MeFragment';

export const GetMeQuery = gql`
query Me {
  Me {
    ...MeFragment
  }
}

${MeFragment}
`