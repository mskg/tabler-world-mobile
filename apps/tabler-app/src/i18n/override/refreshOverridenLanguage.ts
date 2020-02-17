import * as FileSystem from 'expo-file-system';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { Translations } from '../../model/graphql/Translations';
import { GetTranslationsQuery } from '../../queries/Admin/GetTranslationsQuery';
import { logger } from './logger';

export async function refreshOverridenLanguage(lang: string) {
    const client = cachedAolloClient();
    const translations = await client.query<Translations>({
        query: GetTranslationsQuery,
        variables: {
            id: lang,
        },
        fetchPolicy: 'network-only',
    });

    if (translations.data && translations.data.Translations) {
        await FileSystem.makeDirectoryAsync(
            `${FileSystem.documentDirectory}i18n/`,
            { intermediates: true },
        );

        await FileSystem.writeAsStringAsync(
            `${FileSystem.documentDirectory}i18n/override_${lang}.json`,
            JSON.stringify(translations.data.Translations),
        );
    } else {
        try {
            await FileSystem.deleteAsync(
                `${FileSystem.documentDirectory}i18n/override_${lang}.json`,
            );
        } catch (e) {
            logger.log(e);
        }
    }
}
