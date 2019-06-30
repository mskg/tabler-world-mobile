import { BuildStore } from "./BuildStore";

export const store = new BuildStore(
    {
        region: process.env.AWS_REGION,
        endpoint:
            process.env.IS_OFFLINE === 'true'
                ? 'http://localhost:8000'
                : undefined
    },
    {
        tableName: process.env.table || 'typescript',
        ttl: 0
    }
);
