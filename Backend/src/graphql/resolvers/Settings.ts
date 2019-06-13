import _ from "lodash";
import { useDatabase } from "../rds/useDatabase";
import { IApolloContext } from "../types/IApolloContext";

type QuerySettings = {
    name: string,
}

type SettingInput = {
    setting: {
        name: string,
        value: any,
    }
}

export const SettingsResolver = {
    Query: {
        Setting: async (_root: any, args: QuerySettings, context: IApolloContext) => {
            return useDatabase(
                context.logger,
                async (client) => {
                    const result = await client.query(`
SELECT jsonb_extract_path(settings, $2) as value
FROM appsettings
WHERE username = $1`,
                        [context.principal.email, args.name]);
                    return result.rows.length == 1 ? result.rows[0].value : null;
                }
            );
        },

        Settings: async (_root: any, _args: any, context: IApolloContext) => {
            return useDatabase(
                context.logger,
                async (client) => {
                    const result = await client.query(`
SELECT settings as value
FROM appsettings
WHERE username = $1`,
                        [context.principal.email]);

                    const val = result.rows.length == 1
                        ? result.rows[0].value
                        : null;

                    if (val == null) return null;
                    return _(val).keys().map(k => ({
                        name: k,
                        value: val[k]
                    }));
                }
            );
        },
    },

    Mutation: {
        removeSetting: async (_root: any, args: QuerySettings, context: IApolloContext) => {
            return useDatabase(
                context.logger,
                async (client) => {
                    await client.query(`
UPDATE appsettings
SET settings = settings - $2
WHERE username = $1
                        `,
                        [context.principal.email, args.name]);
                    return true;
                }
            )
        },

        putSetting: async (_root: any, args: SettingInput, context: IApolloContext) => {
            if (args == null) return;

            return useDatabase(
                context.logger,
                async (client) => {

                    await client.query(`
INSERT INTO appsettings(username, settings)
VALUES ($1, jsonb_set('{}', $3, $2))
ON CONFLICT (username) DO UPDATE
    SET settings = jsonb_set(excluded.settings, $3, $2)`,
                        [context.principal.email, JSON.stringify(args.setting.value), `{${args.setting.name}}`]);

                    return true;
                }
            );
        },
    }
};