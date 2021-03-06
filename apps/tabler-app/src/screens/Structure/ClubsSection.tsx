import { withTheme } from '@callstack/react-theme-provider';
import { orderBy } from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { Chip, Theme } from 'react-native-paper';
import { connect } from 'react-redux';
import { Accordion } from '../../components/Accordion';
import { I18N } from '../../i18n/translation';
import { showClub } from '../../redux/actions/navigation';
import { styles } from './Styles';

type Props = {
    theme: Theme,
    clubs: { id: string, name: string, clubnumber: number }[],
    showClub: typeof showClub,
};

class ClubsSectionBase extends React.Component<Props> {
    render() {
        if (this.props.clubs == null || this.props.clubs.length === 0) return null;
        const print = orderBy(this.props.clubs, (c) => c.clubnumber);

        return (
            <Accordion style={styles.accordeon} title={I18N.Screen_Structure.clubs}>
                <View style={styles.chipContainer}>
                    {
                        print.map((club) => (
                            <Chip
                                key={club.id}
                                style={styles.chip}
                                onPress={() => {
                                    this.props.showClub(club.id);
                                }}
                            >
                                {club.name}
                            </Chip>
                        ))
                    }
                </View>
            </Accordion>
        );
    }
}

export const ClubsSection = connect(null, { showClub })(
    withTheme(ClubsSectionBase));
