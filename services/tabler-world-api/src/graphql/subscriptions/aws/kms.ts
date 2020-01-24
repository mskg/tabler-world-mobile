import { xAWS } from '@mskg/tabler-world-aws';

export const kms = new xAWS.KMS({
    region: process.env.AWS_REGION,
});
