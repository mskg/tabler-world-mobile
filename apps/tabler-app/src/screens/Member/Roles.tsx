import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { Chip, Text, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { IRole } from '../../model/IRole';
import { showArea, showAssociation, showClub } from '../../redux/actions/navigation';
import { styles } from './Styles';
import color from 'color';

type Props = {
    roles: IRole[],
    theme: Theme,
    showClub: typeof showClub;
    showAssociation: typeof showAssociation;
    showArea: typeof showArea;
};

class RolesBase extends React.PureComponent<Props> {
    getOnPress(role: IRole) {
        if (role.ref.type === 'club') {
            return () => this.props.showClub(role.ref.id);
        }

        if (role.ref.type === 'assoc') {
            return () => this.props.showAssociation(role.ref.id, role.ref.shortname);
        }

        if (role.ref.type === 'area') {
            return () => this.props.showArea(role.ref.id);
        }

        return undefined;
    }

    getColor(role: IRole) {
        if (
            role.ref.type !== 'club'
            && role.ref.type !== 'assoc'
            && role.ref.type !== 'area') {
            return this.props.theme.colors.primary;
        }

        return this.props.theme.colors.accent;
    }

    getTextColor(role: IRole) {
        if (color(this.getColor(role)).isDark()) {
            return '#ffffff';
        }

        return undefined;
    }

    render() {
        return (
            <View style={styles.chipContainer}>
                {(
                    _(this.props.roles || []).orderBy((r) => r.ref.type === 'assoc' ? 1 : r.ref.type === 'area' ? 2 : 3).map((r, i) => (
                        <Chip
                            style={[styles.chip, { backgroundColor: this.getColor(r) }]}
                            key={i}
                            selectedColor={this.getTextColor(r)}
                            onPress={this.getOnPress(r)}
                        >
                            {r.ref.shortname} <Text style={{ color: this.getTextColor(r), fontFamily: this.props.theme.fonts.medium }}>{r.name}</Text>
                        </Chip>
                    )).value()
                )}
            </View>
        );
    }
}

export const Roles = connect(undefined, {
    showClub,
    showAssociation,
    showArea,
})(withTheme(RolesBase));
