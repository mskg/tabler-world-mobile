import { RecordType } from '../../shared/RecordType';

const mapping = {
    [RecordType.member]: 'tabler',
    [RecordType.association]: 'associations',
    [RecordType.area]: 'areas',
    [RecordType.club]: 'clubs',
    [RecordType.family]: 'families',
    [RecordType.group]: 'groups',
};

export function typeToTable(t: RecordType) {
    return mapping[t];
}
