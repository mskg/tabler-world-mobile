import gql from 'graphql-tag';

export const ChatMessageFragment = gql`
    fragment ChatMessageFragment on ChatMessage {
        id
        eventId

        payload {
            text
            image
        }

        sender {
            id
            firstname
            lastname
            pic
        }

        # senderId
        receivedAt

        delivered
        accepted
    }
`;
