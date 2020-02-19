import { writeFileSync } from 'fs';
import en from '../src/i18n/translations/en';

// tslint:disable-next-line: prefer-template
writeFileSync(__dirname + '/../src/i18n/translations/en_strings.json', JSON.stringify(en, null, 4));
console.log('Wrote en_strings.json');