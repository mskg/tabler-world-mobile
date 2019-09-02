import React from 'react';
import { Dimensions, ScrollView, View } from 'react-native';
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
    }[],

    expand?: boolean,
};

type State = {
};

// const width = Dimensions.get("window").width / 2 - 32 - 32;
const widthMax = Dimensions.get('window').width / 2 - 32 - 18;

export class RoleScrollView extends React.Component<Props, State> {
    render() {
        const grouped = sortGroupRoles(this.props.roles);
        if (grouped == null) return null;

        if (this.props.expand === true) {
            return (
                <View style={{ flexWrap: 'wrap', flexDirection: 'row' }}>
                    {
                        grouped.map((r, i) => (
                            <View style={{ marginRight: 16, marginTop: 4, marginBottom: 12 }} key={r.member.id}>
                                <RoleAvatar
                                    member={r.member}
                                    role={r.role}
                                    width={widthMax}
                                />
                            </View>
                        ))
                    }
                </View>
            );
        }

        return (
            <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                {
                    grouped.map((r, i) => (
                        <View style={{ marginRight: 16, marginTop: 4 }} key={r.member.id}>
                            <RoleAvatar
                                member={r.member}
                                role={r.role}
                                width={widthMax}
                            />
                        </View>
                    ))
                }
            </ScrollView>
        );
    }
}
