import React from 'react';
import { View } from 'react-native';
import { Chip, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { showAssociation, showClub } from '../../redux/actions/navigation';
import { styles } from './Styles';

type Props = {
    member: IMemberOverviewFragment,
    theme: Theme,
    showClub: typeof showClub,
    showAssociation: typeof showAssociation,
};

class OrganizationBase extends React.PureComponent<Props> {
    render() {
        return (
            <View style={styles.chipContainer}>
                <Chip
                    style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                    onPress={() => this.props.showClub(this.props.member.club.id)}
                >
                    {this.props.member.club.name}
                </Chip>
                <Chip style={[styles.chip, { backgroundColor: this.props.theme.colors.primary }]}>
                    {this.props.member.area.name}
                </Chip>
                <Chip
                    style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                    onPress={() => this.props.showAssociation(this.props.member.association.id, this.props.member.association.name)}
                >
                    {this.props.member.association.name}
                </Chip>
            </View>
        );
    }
}

export const Organization = connect(
    undefined,
    { showClub, showAssociation },
)(
    withTheme(OrganizationBase));
