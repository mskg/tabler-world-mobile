import React from 'react';
import { MemberListItemPlaceholder } from '../Placeholder/MemberListItemPlaceholder';

export const RolesPlaceholder = ({ count }) => (
    <>
        {
            Array
                .apply(null, { length: count || 4 } as [])
                .map(Number.call, Number)
                .map((i: any) => (<MemberListItemPlaceholder icon={35} key={i.toString()} />))
        }
    </>
);

