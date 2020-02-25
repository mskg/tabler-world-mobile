import { ILogger } from '@mskg/tabler-world-common';
import { encodeType } from './encodeType';
import { getSQLType } from './getSQLType';

export function logExecutableSQL(logger: ILogger, id: string, text: string, parameters?: any[]) {
    if (parameters) {
        const needsSemicolon = !text.trim().endsWith(';');

        logger.log('[SQL]', `
PREPARE ${id} (${parameters.map(getSQLType).join(',')}) AS
  ${text}
${needsSemicolon ? ';' : ''}
EXECUTE SQL${id}(${parameters.map(encodeType).join(',')});
DEALLOCATE ${id};
`);
    } else {
        logger.log('[SQL]', text);
    }
}
