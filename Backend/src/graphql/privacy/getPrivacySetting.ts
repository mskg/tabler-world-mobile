import { PRIVATE, PUBLIC } from "./DBLevels";
import { FieldNames } from "./FieldNames";
import { PrivacySetting } from "./PrivacySetting";
import { AnyType } from "./WhiteList";

export function getPrivacySetting(tabler: AnyType, type: string) {
    const settings: any = tabler[FieldNames.PrivacySettings];

    if (settings == null) {
        return PRIVATE; // be save
    }

    const setting = JSON
        .parse(settings)
        .find((f: PrivacySetting) => f.type.startsWith(type));

    if (setting == null) {
        // we don't have set, means public
        return PUBLIC;
    }

    return setting.level;
}
