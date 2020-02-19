import { I18N } from '../../i18n/translation';

export function formatSector(sector?: string) {
    if (sector === null) { return null; }
    return I18N.Sectors[sector];
}
