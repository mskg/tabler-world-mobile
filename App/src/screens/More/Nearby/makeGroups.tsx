import { RoleType } from '../../../model/graphql/globalTypes';
import { NearbyMembers_nearbyMembers } from '../../../model/graphql/NearbyMembers';
/**
 * Apollo reuses instances, so we create new ones every time
 */
export const makeGroups = (data: NearbyMembers_nearbyMembers[]) => {
    let group = {
        title: data[0].address.city as string,
        members: [] as NearbyMembers_nearbyMembers[]
    };
    const result: typeof group[] = [];
    const withRoles = data.map(m => {
        const r = {
            ...m,
            member: {
                ...m.member
            }
        };
        r.member.roles = [...(m.member.roles || []), {
            __typename: "Role",
            name: "Member",
            group: "Member",
            level: m.member.club.name,
            ref: {
                __typename: "RoleRef",
                type: RoleType.club,
                name: "RT" + m.member.club.club,
                id: m.member.club.id,
            }
        }];
        return r;
    });
    for (const member of withRoles) {
        if (member.address.city != group.title) {
            result.push(group);
            group = {
                title: member.address.city as string,
                members: [member],
            };
        }
        else {
            group.members.push(member);
        }
    }
    result.push(group);
    return result;
};
