import { reverse } from 'lodash';
import { RecordType } from '../../shared/RecordType';

const determineFamily = (r: any) => {
    if (r && (r as string).match(/ladiescircle/i)) {
        return 'lci';
    }

    return 'rti';
};

const associationPK = (r: any) => `${determineFamily(r.hostname)}_${r.subdomain}`;
const clubPK = (r: any) => `${determineFamily(r.hostname)}_${r.subdomain.replace(/[^a-z]/ig, '')}_${r.subdomain.replace(/[^0-9]/ig, '')}`;
const areaPK = (r: any) => `${determineFamily(r.hostname)}_${reverse(r.subdomain.split('-')).join('_')}`;
const memberPK = (r: any) => r.id;
const familyPK = (r: any) => r.subdomain;

// this is a pure textual matching
const groupPK = (r: any) => {
    if (JSON.stringify(r).match(/ladies circle/i)) {
        return 'lci';
    }

    return 'rti';
}

const mapping = {
    [RecordType.member]: memberPK,
    [RecordType.association]: associationPK,
    [RecordType.area]: areaPK,
    [RecordType.club]: clubPK,
    [RecordType.family]: familyPK,
    [RecordType.group]: groupPK,
};

export function recordTypeToPrimaryKey(t: RecordType): (p: any) => number | string {
    return mapping[t];
}
