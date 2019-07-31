import color from "color";
import _ from 'lodash';
import React from "react";
import { Theme } from "react-native-paper";
import { IRole } from "../../model/IRole";
import { RoleChip } from './RoleChip';

type Props = {
    roles: IRole[],
    theme: Theme,
}

export class RoleChips extends React.PureComponent<Props> {
    render() {
        if (this.props.roles == null || this.props.roles.length === 0) return null;

        const chipColor = color(this.props.theme.colors.text)
            .alpha(0.87)
            .rgb()
            .string();

        return _(this.props.roles).orderBy(r => r.ref.type === "assoc" ? 1 : r.ref.type === "area" ? 2 : 3).map((r, i) => (
            <RoleChip
                key={i}
                color={this.props.theme.colors.primary}
                textColor={chipColor}
                font={this.props.theme.fonts.medium}
                level={r.ref.name}
                text={r.name}
            />
        )).value();
    }
}
