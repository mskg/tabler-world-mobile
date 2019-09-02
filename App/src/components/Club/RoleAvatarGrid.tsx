import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { sortGroupRoles } from '../../helper/sortRoles';
import { RoleAvatar } from './RoleAvatar';

type BoardMember = {
    id: number,
    pic?: string | null,
    firstname: string | null,
    lastname: string | null,
};

type Props = {
    roles: {
        role: string,
        member: BoardMember,
    }[] | null,
    items: number,
};

type State = {
};

export class RoleAvatarGrid extends React.Component<Props, State> {
    render() {
        const grouped = sortGroupRoles(this.props.roles);
        if (grouped == null) return null;

        const nbr = this.props.items;
        const margin = 16;
        const size = (
            Dimensions.get('screen').width
            - 16 * 2 /* padding screen */
            - margin * (nbr + 1) /* padding items */
        ) / nbr; // needs to be squared

        return (
            <View style={styles.container}>
                {
                    grouped.map((r, i) => (
                        <RoleAvatar
                            style={{ marginHorizontal: margin / 2, marginVertical: margin / 2 }}

                            key={r.member.id + r.role}
                            member={r.member}

                            width={size}
                            role={r.role}

                            />
                    ))
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        alignContent: 'center',
        flexWrap: 'wrap',
        marginHorizontal: 8,
    },
});
