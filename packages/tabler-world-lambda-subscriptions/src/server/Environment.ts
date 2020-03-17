// tslint:disable-next-line: variable-name
export const Environment = {
    AWS: {
        Region: process.env.AWS_REGION,
    },

    Throtteling: {
        // websocket publish
        maxParallelDecode: parseInt(process.env.THROTTELING_WS_DECODE || '10', 10),

        // total is delivery * send
        maxParallelDelivery: parseInt(process.env.THROTTELING_WS_DELIVERY || '3', 10),
        maxParallelSend: parseInt(process.env.THROTTELING_WS_SEND || '1', 10),
    },

    stageName: process.env.STAGE,
};
