import { SQSHandler } from "aws-lambda";
import { withClient } from "../helper/withClient";
import { encode } from "./encode";
import { IAddress } from "./IAddress";

// we have a batchsize of 1
export const handler: SQSHandler = async (event, context, callback) => {
    // max degree 1
    await withClient(context, async (client) => {
        const errors = [];

        for (let message of event.Records) {
            const payload = JSON.parse(message.body) as IAddress[];

            for (const addr of payload) {
              try {
                await encode(client, addr);
              } catch (e) {
                errors.push(e);
                console.log(e);
              }
            }
        }

        if (errors.length > 0) {
          throw errors[0];
        }
    });

    callback();
}