import gql from 'graphql-tag';

export const PrepareFileUploadMutation = gql`
    mutation PrepareFileUpload ($conversationId: ID!) {
      prepareFileUpload (conversationId: $conversationId) {
        url
        fields
      }
    }
`;
