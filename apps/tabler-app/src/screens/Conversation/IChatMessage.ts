import { IMessage } from 'react-native-gifted-chat';

export interface IChatMessage extends IMessage {
    channel: string;
    failedSend?: boolean;
}


