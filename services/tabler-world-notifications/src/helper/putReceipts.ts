import { IDataService } from '@mskg/tabler-world-rds-client';
import { ExpoPushTicket } from 'expo-server-sdk';

export async function putReceipts(client: IDataService, tickets: ExpoPushTicket[]) {
    return await client.query(
        `insert into notification_receipts (createdon, data)
values ($1, $2)`,
        // @ts-ignore
        [new Date(), JSON.stringify(tickets)],
    );
}
