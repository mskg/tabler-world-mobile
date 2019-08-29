import { IAddress } from "@mskg/tabler-world-geo";
import { withDatabase } from "@mskg/tabler-world-rds-client";
import { SQSHandler } from "aws-lambda";
import { disableEventSource } from "./helper/disableEventSource";
import { geocode } from "./helper/geocode";

let disabled = false;

// we have a batchsize of 1, and max parallelism of 1
export const handler: SQSHandler = async (event, context, callback) => {
  // kill in flight messages
  if (disabled) throw new Error("disabled due to throtteling");

  // max degree 1
  await withDatabase(context, async (client) => {
    const errors = [];

    for (let message of event.Records) {
      const payload = JSON.parse(message.body) as IAddress[];

      for (const addr of payload) {
        try {
          await geocode(client, addr);
        } catch (e) {
          errors.push(e);
          console.log(e);

          if ((e.toString() as string).match(/429/)) {
            // throttle event
            await disableEventSource();
            disabled = true;

            throw new Error("disabled due to throtteling");
          }
        }
      }
    }

    if (errors.length > 0) {
      throw errors[0];
    }
  });

  callback();
}