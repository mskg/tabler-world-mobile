import React from 'react';
import { View } from 'react-native';
import { Chip, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { CachedImage } from '../../components/Image/CachedImage';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { showArea, showAssociation, showClub, showFamily } from '../../redux/actions/navigation';
import { AppTheme } from '../../theme/AppTheme';
import { styles } from './Styles';

type Props = {
    member: IMemberOverviewFragment,
    theme: AppTheme,
    showClub: typeof showClub,
    showAssociation: typeof showAssociation,
    showArea: typeof showArea,
    showFamily: typeof showFamily,
};

class OrganizationBase extends React.PureComponent<Props> {
    render() {
        return (
            <View style={styles.chipContainer}>
                <Chip
                    style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                    selectedColor={this.props.theme.colors.textOnAccent}
                    onPress={() => this.props.showClub(this.props.member.club.id)}
                >
                    {this.props.member.club.name}
                </Chip>
                <Chip
                    style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                    selectedColor={this.props.theme.colors.textOnAccent}
                    onPress={() => this.props.showArea(this.props.member.area.id)}
                >
                    {this.props.member.area.name}
                </Chip>
                <Chip
                    style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                    selectedColor={this.props.theme.colors.textOnAccent}
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
                <Chip
                    style={[styles.chip, { backgroundColor: this.props.theme.colors.accent }]}
                    selectedColor={this.props.theme.colors.textOnAccent}
                    avatar={this.props.member.family.icon ? (
                        <View>
                            <CachedImage
                                style={{ width: 24, height: 24, borderRadius: 12 }}
                                cacheGroup={'other'}
                                uri={this.props.member.family.icon}
                                resizeMode={'cover'}
                            />
                        </View>
                    ) : undefined
                    }
                    onPress={() => this.props.showFamily(this.props.member.family.id)}
                >
                    {this.props.member.family.name}
                </Chip>
            </View >
        );
    }
}

export const Organization = connect(
    undefined,
    { showClub, showAssociation, showFamily, showArea },
)(
    withTheme(OrganizationBase));
