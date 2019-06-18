import color from "color";
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
        const chipColor = color(this.props.theme.colors.text)
            .alpha(0.87)
            .rgb()
            .string();

        // const chips = [
        //     ...(this.props.roles || []).map(r => ({
        //         text: r.name,
        //         level: getRoleLevel(r),
        //     }))
        // ];

        return (this.props.roles || []).map((r, i) => (
            <RoleChip
                key={i}
                color={this.props.theme.colors.primary}
                textColor={chipColor}
                font={this.props.theme.fonts.medium}
                level={r.ref.name}
                text={r.name}
            />
        ));
    }
}
