import React from 'react';
import { View } from 'react-native';
import { Chip, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { GetMemberQueryType_Member } from '../../queries/GetMemberQuery';
import { showClub } from '../../redux/actions/navigation';
import { styles } from './Styles';

type Props = {
    member: GetMemberQueryType_Member,
    theme: Theme,
    showClub: typeof showClub,
};

class OrganizationBase extends React.PureComponent<Props> {
    render() {
        return <View style={styles.chipContainer}>
            <Chip
                style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                onPress={() => this.props.showClub(this.props.member.club.id)}
            >
                {this.props.member.club.name}
            </Chip>
            <Chip style={[styles.chip, { backgroundColor: this.props.theme.colors.primary }]}>
                {this.props.member.area.name}
            </Chip>
            <Chip style={[styles.chip, { backgroundColor: this.props.theme.colors.primary }]}>
                {this.props.member.association.name}
            </Chip>
        </View>;
    }
}

export const Organization = connect(undefined,
                                    {
        showClub,
    })(withTheme(OrganizationBase));
