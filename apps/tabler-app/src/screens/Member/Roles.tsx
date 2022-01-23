import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { Chip, Text, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { IRole } from '../../model/IRole';
import { showArea, showAssociation, showClub, showFamily } from '../../redux/actions/navigation';
import { AppTheme } from '../../theme/AppTheme';
import { styles } from './Styles';

type Props = {
    roles: IRole[],
    theme: AppTheme,
    showClub: typeof showClub;
    showAssociation: typeof showAssociation;
    showArea: typeof showArea;
    showFamily: typeof showFamily;
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

        if (role.ref.type === 'family') {
            return () => this.props.showFamily(role.ref.id);
        }

        return undefined;
    }

    render() {
        return (
            <View style={styles.chipContainer}>
                {(
                    _(this.props.roles || []).orderBy((r) => r.ref.type === 'assoc' ? 1 : r.ref.type === 'area' ? 2 : 3).map((r, i) => (
                        <Chip
                            style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                            key={i}
                            selectedColor={this.props.theme.colors.textOnAccent}
                            onPress={this.getOnPress(r)}
                        >
                            {r.ref.shortname} <Text style={{ color: this.props.theme.colors.textOnAccent, fontFamily: this.props.theme.fonts.medium }}>{r.name}</Text>
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
    showFamily,
})(withTheme(RolesBase));
