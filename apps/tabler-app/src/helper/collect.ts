import _ from 'lodash';
import { Member_Member, Member_Member_companies, Member_Member_emails, Member_Member_phonenumbers } from '../model/graphql/Member';
import { formatPhone } from './formatting/formatPhone';

export function collectPhones(member?: Member_Member | null): (Member_Member_phonenumbers & { mobile: boolean })[] {
    if (member == null) { return []; }

    return _(member.phonenumbers || [])
        .map((n) => ({
            ...n,
            ...formatPhone(n.value, member.association.isocode),
        }))
        .concat(
            // @ts-ignore nulls are filtered
            (member.companies || []).map(
                (c: Member_Member_companies) => {
                    if (c.phone == null || c.phone === '') { return undefined; }

                    const nbr = formatPhone(c.phone, member.association.isocode);
                    return ({
                        type: 'work',
                        ...nbr,
                        __typename: 'CommunicationElement' as 'CommunicationElement',
                    });
                }),
        )
        .filter((v) => v != null)
        .uniqBy((v) => v.value)
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
        .uniqBy((v) => v.value.toLocaleLowerCase())
        .toArray()
        .value();
}
