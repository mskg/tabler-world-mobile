// tslint:disable-next-line: variable-name
export const Environment = {
    Queue: process.env.PUSH_QUEUE,
    SNS: {
        Android: process.env.SNS_ANDROID as string,
        iOS: process.env.SNS_IOS as string,
    },
};
