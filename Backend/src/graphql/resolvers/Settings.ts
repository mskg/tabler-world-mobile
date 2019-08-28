import { useDataService } from "@mskg/tabler-world-rds";
import _ from "lodash";
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
            return useDataService(
                context,
                async (client) => {
                    const result = await client.query(`
SELECT jsonb_extract_path(settings, $2) as value
FROM usersettings
WHERE id = $1`,
                        [context.principal.id, args.name]);
                    return result.rows.length == 1 ? result.rows[0].value : null;
                }
            );
        },

        Settings: async (_root: any, _args: any, context: IApolloContext) => {
            return useDataService(
                context,
                async (client) => {
                    const result = await client.query(`
SELECT settings as value
FROM usersettings
WHERE id = $1`,
                        [context.principal.id]);

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
            return useDataService(
                context,
                async (client) => {
                    await client.query(`
UPDATE usersettings
SET settings = settings - $2
WHERE id = $1
                        `,
                        [context.principal.id, args.name]);
                    return true;
                }
            )
        },

        putSetting: async (_root: any, args: SettingInput, context: IApolloContext) => {
            if (args == null) return;

            return useDataService(
                context,
                async (client) => {

                    await client.query(`
INSERT INTO usersettings(id, settings)
VALUES ($1, jsonb_set('{}', $3, $2))
ON CONFLICT (id) DO UPDATE
    SET settings = jsonb_set(coalesce(usersettings.settings, '{}'), $3, $2)`,
                        [context.principal.id, JSON.stringify(args.setting.value), `{${args.setting.name}}`]);

                    return true;
                }
            );
        },
    }
};