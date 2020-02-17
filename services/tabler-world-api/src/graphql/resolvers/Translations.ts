import { cachedLoad, makeCacheKey } from '@mskg/tabler-world-cache';
import { POEditorApi } from '../dataSources/POEditorApi';
import { IApolloContext } from '../types/IApolloContext';

// tslint:disable: export-name
// tslint:disable: variable-name
export const TranslationsResolver = {
    Query: {
        Languages: async (_root: any, _params: any, context: IApolloContext) => {
            const response = await cachedLoad(
                context,
                makeCacheKey('Resource', ['i18n', 'languages']),
                () => POEditorApi.call('/v2/languages/list'),
                'I18N',
            );

            return response.result.languages.map((l: any) => {
                return l.code;
            });
        },

        Translations: async (_root: any, { language }: any, _context: IApolloContext) => {
            const response = await POEditorApi.call(
                '/v2/terms/list',
                {
                    language,
                },
            );

            // await cachedLoad(
            //     context,
            //     makeCacheKey('Resource', ['i18n', 'language', language]),
            //     () => POEditorApi.call(
            //         '/v2/terms/list',
            //         {
            //             language,
            //         },
            //     ),
            //     'I18N',
            // );

            const translations: any = {};

            for (const term of response.result.terms) {
                let newValue;

                // no content
                if (term.translation.content === '' || term.translation.content === null) {
                    continue;
                }

                // no plural content
                if (typeof (term.translation.content) === 'object' && Object.keys(term.translation.content).length === 0) {
                    continue;
                } else {
                    newValue = term.translation.content;
                }

                let v: any;

                if (term.context) {
                    term.context.split('.').forEach((c: string) => {
                        // key is surounded by "
                        const key = c.substring(1, c.length - 1);

                        if (!translations[key]) {
                            translations[key] = {};
                        }

                        v = translations[key];
                    });
                }

                v[term.term] = newValue;
            }

            return translations;
        },
    },
};
