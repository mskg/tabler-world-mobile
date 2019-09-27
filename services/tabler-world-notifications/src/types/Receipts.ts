import { ExpoPushTicket } from 'expo-server-sdk';

export type Receipts = {
    id: number;
    createdon: Date;
    data: ExpoPushTicket[];
};
