import { getParameters, Param_Translations } from '@mskg/tabler-world-config';

export const getI18NParameters = async () => {
    const { i18n } = await getParameters('i18n');
    return JSON.parse(i18n) as Param_Translations;
};
