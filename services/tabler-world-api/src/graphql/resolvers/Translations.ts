import { cachedLoad, makeCacheKey } from '@mskg/tabler-world-cache';
import { POEditorApi } from '../dataSources/POEditorApi';
import { pseudoLocalize } from '../helper/pseudoLocalize';
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

            return [
                'pseudo',
                ...response.result.languages.map((l: any) => {
                    return l.code;
                }),
            ];
        },

        Translations: async (_root: any, { language }: any, _context: IApolloContext) => {
            const response = await POEditorApi.call(
                '/v2/terms/list',
                {
                    language: language === 'pseudo' ? 'en' : language,
                },
            );

            const translations: any = {};

            for (const term of response.result.terms) {
                let newValue: any;

                // no content
                if (term.translation.content === '' || term.translation.content == null) {
                    continue;
                }

                // no plural content
                if (typeof (term.translation.content) === 'object' && Object.keys(term.translation.content).length === 0) {
                    continue;
                } else {
                    newValue = term.translation.content;
                }

                let node = translations;

                if (term.context) {
                    term.context.split('.').forEach((c: string) => {
                        // key is surounded by "
                        const key = c.substring(1, c.length - 1);
                        console.log('>', key);

                        if (!node[key]) {
                            node[key] = {};
                        }

                        node = node[key];
                    });
                }

                if (language === 'pseudo') {
                    if (typeof (newValue) === 'object') {
                        node[term.term] = {
                            // @ts-ignore
                            ...Object.keys(newValue).map((k) => pseudoLocalize(newValue[k])),
                        };
                    } else {
                        node[term.term] = pseudoLocalize(newValue);
                    }
                } else {
                    node[term.term] = newValue;
                }
            }

            return translations;
        },
    },
};
