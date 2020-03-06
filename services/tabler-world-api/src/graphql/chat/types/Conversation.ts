import DynamoDB from 'aws-sdk/clients/dynamodb';

export type Conversation = {
    lastMessage?: string;
    members?: DynamoDB.DocumentClient.NumberSet;
    channelKey?: string;
};
