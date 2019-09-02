import { FieldNames, standard_fields, system_fields } from './FieldNames';
import { FilterLevel } from './FilterLevel';
import { getPrivacySetting } from './getPrivacySetting';
import { hasAccess } from './hasAccess';

export type AnyType = { [key: string]: any };
type WhiteListFunction = (level: FilterLevel, t: AnyType) => string[];

const unprotected = [...system_fields, ...standard_fields];

// tslint:disable-next-line: variable-name
export const WhiteList: WhiteListFunction[] = [
    () => unprotected,

    // birth_place
    (level, tabler) => {
        const priv = getPrivacySetting(tabler, 'company-position');
        return hasAccess(priv, level) ? [FieldNames.Companies] : [];
    },

    (level, tabler) => {
        const priv = getPrivacySetting(tabler, 'education');
        return hasAccess(priv, level) ? [FieldNames.Educations] : [];
    },

    (level, tabler) => {
        const priv = getPrivacySetting(tabler, 'custom-field-category-110');
        return hasAccess(priv, level) ? [FieldNames.Partner] : [];
    },

    (level, tabler) => {
        // there is only one that we extract
        const priv = getPrivacySetting(tabler, 'address-');
        return hasAccess(priv, level) ? [FieldNames.Address] : [];
    },

    (level, tabler) => {
        const phones = (tabler[FieldNames.Phonenumbers] || []).map((p: any) => {
            const priv = getPrivacySetting(tabler, `phone-${p.id}`);
            return hasAccess(priv, level) ? {
                type: p.type,
                value: p.value,
            } : null;
        }).filter((p: any) => p != null);

        return phones.length > 0 ? [FieldNames.Phonenumbers] : [];
    },

    (level, tabler) => {
        const emails = (tabler[FieldNames.Emails] || []).map((p: any) => {
            const priv = getPrivacySetting(tabler, `secondary-email-${p.id}`);
            return hasAccess(priv, level) ? {
                type: p.type,
                value: p.value,
            } : null;
        }).filter((p: any) => p != null);

        return emails.length > 0 ? [FieldNames.Emails] : [];
    },

    (level, tabler) => {
        const priv = getPrivacySetting(tabler, 'birth_date');
        return hasAccess(priv, level) ? [FieldNames.BirthDate] : [];
    },
];


