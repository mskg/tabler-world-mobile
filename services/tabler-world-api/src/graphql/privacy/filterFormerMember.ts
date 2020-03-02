import { former_fields } from './FieldNames';
import { AnyType } from './WhiteList';

export function filterFormerMember(member: AnyType): AnyType {
    const result: AnyType = {};
    for (const field of former_fields) {
        const val = member[field];

        if (val != null && val !== '') {
            result[field] = val;
        }
    }

    return result;
}
