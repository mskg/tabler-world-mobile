import _ from 'lodash';
import { Member_Member, Member_Member_companies, Member_Member_emails, Member_Member_phonenumbers } from '../model/graphql/Member';

function normalizePhone(p: string | null): string | undefined {
    if (p == null) return undefined;

    let nbrs = p.replace(/[^\d]/g, '');
    nbrs = nbrs.replace(/[^\d]/g, '');
    nbrs = nbrs.replace(/^(49)/, '');
    nbrs = nbrs.replace(/^0*/, '');

    return nbrs;
}

export function collectPhones(member?: Member_Member | null): Member_Member_phonenumbers[] {
    if (member == null || member.phonenumbers == null) return [];

    return _(member.phonenumbers || [])
        .concat(
            // @ts-ignore nulls are filtered
            (member.companies || []).map(
                (c: Member_Member_companies) => c.phone != null && c.phone !== ''
                    ? ({
                        type: 'work',
                        value: c.phone || '',
                        __typename: 'CommunicationElement' as 'CommunicationElement',
                    }) as Member_Member_phonenumbers
                    : undefined,
            ),
        )
        .filter((v) => v != null)
        .uniqBy((v) => normalizePhone(v.value))
        .toArray()
        .value();
}

export function collectEMails(member?: Member_Member | null): Member_Member_emails[] {
    if (member == null) return [];

    return _([{
        __typename: 'CommunicationElement' as 'CommunicationElement',
        type: 'rt',
        value: member.rtemail,
    } as Member_Member_emails])
        .concat(member.emails || [])
        .concat(
            // @ts-ignore nulls are filtered
            (member.companies || []).map(
                (c: Member_Member_companies) => ({
                    type: 'work',
                    value: c.email || '',
                    __typename: 'CommunicationElement' as 'CommunicationElement',
                }),
            ),
        )
        .filter((r) => r.value != null && r.value !== '')
        .uniqBy((v) => v.value)
        .toArray()
        .value();
}
