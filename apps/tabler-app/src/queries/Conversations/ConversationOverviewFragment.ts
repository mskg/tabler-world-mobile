import gql from 'graphql-tag';
import { MemberAvatarFragment } from './MemberAvatarFragment';

export const ConversationOverviewFragment = gql`
    fragment ConversationOverviewFragment on Conversation {
        id
        hasUnreadMessages
        members {
            ...MemberAvatarFragment
        }
    }

    ${MemberAvatarFragment}
`;
