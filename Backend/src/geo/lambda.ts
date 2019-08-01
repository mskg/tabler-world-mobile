import { SQSHandler } from "aws-lambda";
import { withClient } from "../helper/withClient";
import { encode } from "./encode";
import { IAddress } from "./IAddress";

export const handler: SQSHandler = async (event, context, callback) => {
    // max degree 1
    await withClient(context, async (client) => {
        for (let message of event.Records) {
            const payload = JSON.parse(message.body) as IAddress[];

            for (const addr of payload) {
              try {
                await encode(client, addr);
              } catch (e) {
                console.log(e);
              }
            }
        }
    });

    callback();
}