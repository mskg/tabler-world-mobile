import { NearbyMembers_nearbyMembers } from '../../../model/graphql/NearbyMembers';

function makeDisplayString(member: NearbyMembers_nearbyMembers) {
    return (member.address.city || member.address.region);
}

/**
 * Apollo reuses instances, so we create new ones every time
 */
export function makeGroups(data: NearbyMembers_nearbyMembers[]) {
    let group = {
        title: makeDisplayString(data[0]),
        country: data[0].address.country,
        members: [] as NearbyMembers_nearbyMembers[],
    };

    const result: typeof group[] = [];
    // const withRoles = data.map((m) => {
    //     const r = {
    //         ...m,
    //         member: {
    //             ...m.member,
    //         },
    //     };

    //     r.member.roles = [...(m.member.roles || []), {
    //         __typename: 'Role',
    //         name: 'Member',
    //         group: 'Member',
    //         level: m.member.club.name,
    //         ref: {
    //             __typename: 'RoleRef',
    //             type: RoleType.club,
    //             shortname: `RT${m.member.club.clubnumber}`,
    //             id: m.member.club.id,
    //         },
    //     }];

    //     return r;
    // });

    for (const member of data) {
        const title = makeDisplayString(member);
        if (title !== group.title) {
            result.push(group);
            group = {
                title: title as string,
                country: member.address.country,
                members: [member],
            };
        } else {
            group.members.push(member);
        }
    }

    result.push(group);
    return result;
}
