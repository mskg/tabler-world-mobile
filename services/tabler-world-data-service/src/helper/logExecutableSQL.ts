import { IDataQuery } from '@mskg/tabler-world-rds-client';
import { encodeType } from './encodeType';
import { getSQLType } from './getSQLType';

export function logExecutableSQL(id: string, query: IDataQuery) {
    if (query.parameters) {

        const needsSemicolon = !query.text.trim().endsWith(';');

        console.log(`
PREPARE ${id} (${query.parameters.map(getSQLType).join(',')}) AS
  ${query.text}
${needsSemicolon ? ';' : ''}
EXECUTE ${id}(${query.parameters.map(encodeType).join(',')});
DEALLOCATE ${id};
`);
    } else {
        console.log(query);
    }
}
