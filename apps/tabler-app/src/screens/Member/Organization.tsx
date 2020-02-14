import React from 'react';
import { View } from 'react-native';
import { Chip, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { CachedImage } from '../../components/Image/CachedImage';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { showArea, showAssociation, showClub } from '../../redux/actions/navigation';
import { styles } from './Styles';

type Props = {
    member: IMemberOverviewFragment,
    theme: Theme,
    showClub: typeof showClub,
    showAssociation: typeof showAssociation,
    showArea: typeof showArea,
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
                <Chip
                    style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                    onPress={() => this.props.showArea(this.props.member.area.id)}
                >
                    {this.props.member.area.name}
                </Chip>
                <Chip
                    style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                    avatar={this.props.member.association.flag ? (
                        <View>
                            <CachedImage
                                style={{ width: 24, height: 24, borderRadius: 12 }}
                                cacheGroup={'other'}
                                uri={this.props.member.association.flag}
                                resizeMode={'cover'}
                            />
                        </View>
                    ) : undefined
                    }
                    onPress={() => this.props.showAssociation(this.props.member.association.id, this.props.member.association.name)}
                >
                    {this.props.member.association.name}
                </Chip>
            </View >
        );
    }
}

export const Organization = connect(
    undefined,
    { showClub, showAssociation, showArea },
)(
    withTheme(OrganizationBase));
