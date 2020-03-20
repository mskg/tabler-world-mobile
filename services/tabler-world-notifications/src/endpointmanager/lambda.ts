import { Handler } from 'aws-lambda';
import { Payload } from './Payload';
import { register } from './register';

// tslint:disable-next-line: export-name
export const handler: Handler<Payload, string> = async (event, context) => {
    console.log(event);

    if (event.action === 'register') {
        await register(context, event);
    }

    return 'ok';
};
