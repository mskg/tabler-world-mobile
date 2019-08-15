import { getParameters } from "../../shared/parameters/getParameters";
import { IApolloContext } from "../types/IApolloContext";

export const ParametersResolver = {
    Query: {
        getParameters: async (_root: any, _args: {}, context: IApolloContext) => {
            try {
                const appParam = await getParameters("app");
                const app = JSON.parse(appParam.app) as any;

                return Object.keys(app).map(k => ({
                    name: k,
                    value: app[k]
                }));
            } catch (e) {
                context.logger.error("Failed to getParameters", e);
                return null;
            }
        },
    },
};