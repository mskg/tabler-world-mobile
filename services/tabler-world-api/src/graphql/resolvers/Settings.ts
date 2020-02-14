import { PushNotificationService } from '@mskg/tabler-world-push-client';
import { useDataService } from '@mskg/tabler-world-rds-client';
import { keys, remove, uniq } from 'lodash';
import { byVersion, v12Check } from '../helper/byVersion';
import { IApolloContext } from '../types/IApolloContext';

type QuerySettings = {
    name: string,
};

type SettingInput = {
    setting: {
        name: string,
        value: any,
    },
};

// tslint:disable: export-name
// tslint:disable: variable-name
export const SettingsResolver = {
    Query: {
        Setting: async (_root: any, args: QuerySettings, context: IApolloContext) => {
            return useDataService(
                context,
                async (client) => {
                    const result = await client.query(
                        `
SELECT jsonb_extract_path(settings, $2) as value
FROM usersettings
WHERE id = $1`,
                        [context.principal.id, args.name],
                    );
                    return result.rows.length == 1 ? result.rows[0].value : null;
                },
            );
        },

        Settings: async (_root: any, _args: any, context: IApolloContext) => {
            return useDataService(
                context,
                async (client) => {
                    const result = await client.query(
                        `
SELECT settings as value
FROM usersettings
WHERE id = $1`,
                        [context.principal.id],
                    );

                    const val = result.rows.length === 1
                        ? result.rows[0].value
                        : null;

                    if (val == null) { return null; }
                    return keys(val).map((k) => ({
                        name: k,
                        value: val[k],
                    }));
                },
            );
        },
    },

    Mutation: {
        testPushNotifications: async (_root: any, _args: QuerySettings, context: IApolloContext) => {
            const service = new PushNotificationService();
            await service.send([{
                member: context.principal.id,
                reason: 'test',
                title: 'Whohooo!',
                body: 'You\'re all set.',
                payload: {
                    reason: 'test',
                    title: 'Whohooo!',
                    body: 'You\'re all set.',
                },
            }]);
        },

        removeSetting: async (_root: any, args: QuerySettings, context: IApolloContext) => {
            return useDataService(
                context,
                async (client) => {
                    await client.query(
                        `
UPDATE usersettings
SET settings = settings - $2
WHERE id = $1
                        `,
                        [context.principal.id, args.name]);
                    return true;
                },
            );
        },

        putSetting: async (_root: any, args: SettingInput, context: IApolloContext) => {
            if (args == null) { return; }

            const modifiedArgs = { ...args };

            // we must do this, as long as there are old records out in the field
            if (modifiedArgs.setting.name === 'favorites') {
                await byVersion({
                    context,
                    mapVersion: v12Check,
                    versions: {
                        default: async () => {
                            context.logger.log('No change necessary, new client');
                        },

                        old: async () => {
                            const mapping = await useDataService(context, async (client) => await client.query(
                                `select * from profile_mapping where oldid = ANY($1)`,
                                [modifiedArgs.setting.value],
                            ));

                            const oldIds = mapping.rows.map((r) => r.oldid as number) || [];
                            const newIds = mapping.rows.map((r) => r.newid as number) || [];

                            if (oldIds.length !== 0) {
                                const arr = modifiedArgs.setting.value as number[];
                                context.logger.log('Replacing', oldIds, 'with', newIds);

                                remove(arr, (f) => oldIds.indexOf(f) !== -1);
                                modifiedArgs.setting.value = uniq([...arr, ...newIds]);

                                context.logger.log('Old', args.setting.value, 'result', modifiedArgs.setting.value);
                            } else {
                                context.logger.log('No mapping necessary');
                            }
                        },
                    },
                });
            }

            return useDataService(
                context,
                async (client) => {
                    await client.query(
                        `
INSERT INTO usersettings(id, settings)
VALUES ($1, jsonb_set('{}', $3, $2))
ON CONFLICT (id) DO UPDATE
    SET settings = jsonb_set(coalesce(usersettings.settings, '{}'), $3, $2)`,
                        [
                            context.principal.id,
                            JSON.stringify(modifiedArgs.setting.value),
                            `{${modifiedArgs.setting.name}}`,
                        ],
                    );

                    return true;
                },
            );
        },
    },
};
