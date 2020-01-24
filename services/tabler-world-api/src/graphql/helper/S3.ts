import { EXECUTING_OFFLINE, xAWS } from '@mskg/tabler-world-aws';

export const S3 = new xAWS.S3({
    s3ForcePathStyle: true,
    accessKeyId: EXECUTING_OFFLINE ? 'S3RVER' : undefined,
    secretAccessKey: EXECUTING_OFFLINE ? 'S3RVER' : undefined,
    endpoint: EXECUTING_OFFLINE ? 'http://localhost:8005' : undefined,
    signatureVersion: 'v4',
});

export const UPLOAD_BUCKET = process.env.UPLOAD_BUCKET as string;
