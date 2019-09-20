import { PubSub } from 'graphql-subscriptions';
import { Connection } from '../models/Connection';

type Root = {
    id: string,
};

type Context = {
    connectionId: string,
};

// tslint:disable-next-line: variable-name
export const subscribeResolver = () => async (root: Root, _args: any, { connectionId }: Context, info: any) => {
    console.log(info);

    await new Connection(connectionId).subscribe(root.id);
    return new PubSub().asyncIterator(['*']);
};
