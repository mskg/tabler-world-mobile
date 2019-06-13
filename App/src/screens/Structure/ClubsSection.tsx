import { withTheme } from '@callstack/react-theme-provider';
import _ from 'lodash';
import React from 'react';
import { View } from 'react-native';
import { Chip, Theme } from 'react-native-paper';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { Accordion } from '../../components/Accordion';
import { I18N } from '../../i18n/translation';
import { IAppState } from '../../model/IAppState';
import { showClub } from '../../redux/actions/navigation';
import { styles } from './Styles';

type Props = {
    theme: Theme,
    navigation: any,

    clubs: {id: string, name: string, club: number}[],
    showClub: typeof showClub,
};

type State = {
};

class ClubsSectionBase extends React.Component<Props, State> {
    render() {
        if (this.props.clubs == null || this.props.clubs.length == 0) return null;

        const print = _(this.props.clubs)
            .orderBy(c => c.club);

        return (
            <Accordion style={styles.accordeon} title={I18N.Structure.clubs}>
                <View style={styles.chipContainer}>
                    {
                        print.map(club => (
                            <Chip key={club.id} style={styles.chip} onPress={() => {
                                this.props.showClub(club.id);
                            }}>
                                {club.name}
                            </Chip>
                        ))
                        .value()
                    }
                </View>
            </Accordion>
        );
    }
}

export const ClubsSection = connect(
    (state: IAppState) => ({
    }), {
        showClub
    })(withNavigation(withTheme(ClubsSectionBase)));
