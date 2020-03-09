import { encodeType } from './encodeType';
import { getSQLType } from './getSQLType';

export function logExecutableSQL(logger: (...params: any[]) => void, id: string, text: string, parameters?: any[]) {
    if (parameters) {
        const needsSemicolon = !text.trim().endsWith(';');

        logger('[SQL]', `
PREPARE ${id} (${parameters.map(getSQLType).join(',')}) AS
  ${text}
${needsSemicolon ? ';' : ''}
EXECUTE ${id}(${parameters.map(encodeType).join(',')});
DEALLOCATE ${id};
`);
    } else {
        logger('[SQL]', text);
    }
}
