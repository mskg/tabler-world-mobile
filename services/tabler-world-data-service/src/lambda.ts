import { IDataQuery, useDatabase } from '@mskg/tabler-world-rds-client';
import { Handler } from 'aws-lambda';
import warmer from 'lambda-warmer';
import { logExecutableSQL } from './helper/logExecutableSQL';

// tslint:disable-next-line: export-name
export const handler: Handler<IDataQuery, any> = (event, context, callback) => {
    warmer(event).then((isWarmer: boolean) => {
        if (isWarmer) {
            callback(null, { statusCode: 200, body: 'warmed' });
        } else {
            console.log(
                logExecutableSQL(
                    context.awsRequestId.replace(/[^A-Za-z0-9]/ig, ''),
                    event,
                ),
            );

            useDatabase(
                { logger: console },
                (client) => client.query(event.text, event.parameters),
            )
                .then(
                    (result) => { callback(null, result); },
                    (error) => { callback(error); },
                );
        }
    });
};
