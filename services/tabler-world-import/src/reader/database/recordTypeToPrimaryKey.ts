import { reverse } from 'lodash';
import { RecordType } from '../../shared/RecordType';
import { TargetType } from '../types/TargetType';

const determineFamily = (r: any) => {
    if (r && (r as string).match(/ladiescircle/i)) {
        return TargetType.LCI;
    }

    if (r && (r as string).match(/41er/i)) {
        return TargetType.C41;
    }

    return TargetType.RTI;
};

const associationPK = (r: any) => `${determineFamily(r.hostname)}_${r.subdomain}`;
const clubPK = (r: any) => {
    const family = determineFamily(r.hostname);

    const parts = r.subdomain.split('-');
    const assoc = parts[1];
    const club = parts[0];

    return `${family}_${assoc}_${club}`;
};

const areaPK = (r: any) => `${determineFamily(r.hostname)}_${reverse(r.subdomain.split('-')).join('_')}`;
const memberPK = (r: any) => r.id;
const familyPK = (r: any) => {
    // does not match name in our records
    if (r.subdomain === '41int') return TargetType.C41;
    return r.subdomain;

};

// this is a pure textual matching
const groupPK = (r: any) => {
    if (JSON.stringify(r).match(/ladies circle/i)) {
        return TargetType.LCI;
    }

    if (JSON.stringify(r).match(/41er/i)) {
        return TargetType.C41;
    }

    return TargetType.RTI;
};

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
