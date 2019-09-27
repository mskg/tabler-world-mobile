import gql from 'graphql-tag';
export const ChatMessageFragment = gql`
    fragment ChatMessageFragment on ChatMessage {
        id
        eventId
        payload
        senderId
        receivedAt
        sent
    }
`;
