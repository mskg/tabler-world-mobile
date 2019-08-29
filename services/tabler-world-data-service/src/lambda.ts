import { IDataQuery, useDatabase } from "@mskg/tabler-world-rds-client";
import { Handler } from 'aws-lambda';
import warmer from 'lambda-warmer';

export const handler: Handler<IDataQuery, any> = (event, _context, callback) => {
  warmer(event).then((isWarmer: boolean) => {
    if (isWarmer) {
      callback(null, { statusCode: 200, body: 'warmed' });
    } else {
      console.log(event);

      useDatabase(
        { logger: console },
        (client) => client.query(event.text, event.parameters)
      )
        .then(
          (result) => { callback(null, result); },
          (error) => { callback(error); }
        );
    }
  });
}
