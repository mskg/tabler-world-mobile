import React from 'react';
import { List } from 'react-native-paper';
import { sortGroupRoles } from '../../helper/sortRoles';
import { IAssociationRole } from '../../model/IAssociation';
import { RoleCard } from './RoleCard';

type Props = {
    group: string,
    expanded?: boolean,
    roles: IAssociationRole[],
};

type State = {
};

export class RoleListSection extends React.Component<Props, State> {
    render() {
        const grouped = sortGroupRoles(this.props.roles);
        if (grouped == null) return null;
        const len = grouped.length;

        return (
            <List.Section title={this.props.group}>
                {
                    grouped.map((r, i) => (
                        <RoleCard key={r.member} id={r.member} role={r.role} separator={i !== len - 1} />
                    ))
                }
            </List.Section>
        );
    }
}
