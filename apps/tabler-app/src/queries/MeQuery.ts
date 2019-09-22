import gql from 'graphql-tag';
import { MeFragment } from './MeFragment';

// tslint:disable-next-line: export-name
export const GetMeQuery = gql`
    query Me {
      Me {
        ...MeFragment
      }
    }

    ${MeFragment}
`;
