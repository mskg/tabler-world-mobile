import _ from 'lodash';
import { GetMemberQueryType_Communication, GetMemberQueryType_Company, GetMemberQueryType_Member } from '../screens/Member/Queries';

function normalizePhone(p: string): string | undefined {
    if (p == null) return undefined;

    let nbrs = p.replace(/[^\d]/g, "");
    nbrs = nbrs.replace(/^(49)|0/, "");

    return nbrs;
}

export function collectPhones(member?: GetMemberQueryType_Member): GetMemberQueryType_Communication[] {
    if (member == null || member.phonenumbers == null) return [];

    return _(member.phonenumbers || [])
        .concat(
            (member.companies || []).map(
                (c: GetMemberQueryType_Company) => c.phone
                    ? ({
                        type: "work",
                        value: c.phone,
                    })
                    : undefined
            )
        )
        .filter(Boolean)
        .uniqBy(v => normalizePhone(v.value))
        .toArray()
        .value();
}

export function collectEMails(member?: GetMemberQueryType_Member): GetMemberQueryType_Communication[] {
    if (member == null) return [];

    return _([{
            type: "rt",
            value: member.rtemail,
        }])
        .concat(member.emails || [])
        .concat(
            (member.companies || []).map(
                (c: GetMemberQueryType_Company) => c.email
                    ? ({
                        type: "work",
                        value: c.email,
                    })
                    : undefined
            )
        )
        .filter(Boolean)
        .uniqBy(v => v.value)
        .toArray()
        .value();
}