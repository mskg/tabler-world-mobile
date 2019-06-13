import React from "react";
import { View } from 'react-native';
import { Chip, Text, Theme, withTheme } from "react-native-paper";
import { connect } from 'react-redux';
import { IRole } from "../../model/IMember";
import { showClub } from '../../redux/actions/navigation';
import { styles } from './Styles';

type Props = {
    roles: IRole[],
    theme: Theme,
    showClub: typeof showClub;
}

class RolesBase extends React.PureComponent<Props> {
    getOnPress(role: IRole) {
        if (role.ref.type !== 'club') return undefined;
        return () => this.props.showClub(role.ref.id);
    }

    getColor(role: IRole) {
        if (role.ref.type !== 'club') return this.props.theme.colors.primary;
        return this.props.theme.colors.accent;
    }

    render() {
        return <View style={styles.chipContainer}>
            {
                (this.props.roles || []).map((r, i) => (
                    <Chip
                        style={[styles.chip, { backgroundColor: this.getColor(r) }]}
                        key={i}
                        onPress={this.getOnPress(r)}
                    >
                        {r.ref.name} <Text style={{ fontFamily: this.props.theme.fonts.medium }}>{r.name}</Text>
                    </Chip>
                ))
            }
        </View>;
    }
}


export const Roles = connect(undefined, {
    showClub
})(withTheme(RolesBase));
