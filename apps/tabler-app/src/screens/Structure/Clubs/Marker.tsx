import React from 'react';
import { Dimensions, Platform, StyleSheet } from 'react-native';
import { Callout, LatLng, Marker } from 'react-native-maps';
import { Theme, Title, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { ClubAvatar } from '../../../components/ClubAvatar';
import { ClubsMap_Clubs } from '../../../model/graphql/ClubsMap';
import { showClub } from '../../../redux/actions/navigation';
import { ___DONT_USE_ME_DIRECTLY___COLOR_PIN } from '../../../theme/colors';
import { Pin } from './Pin';

type Props = {
    theme: Theme,
    showClub: typeof showClub,
    club: ClubsMap_Clubs,
};


const maxWidth = Dimensions.get('window').width - 32 - 16;

// Android does not display nested Images
// https://github.com/react-native-community/react-native-maps/issues/1870
const customCallout = Platform.OS !== 'android';

class MarkerBase extends React.Component<Props> {
    _showClub = () => {
        this.props.showClub(this.props.club.id);
    }

    render() {
        return (
            <Marker
                identifier={this.props.club.id}
                coordinate={this.props.club.location as LatLng}
                tracksViewChanges={false}

                title={this.props.club.name}
                onCalloutPress={!customCallout ? this._showClub : undefined}
            >
                <Pin
                    color={this.props.theme.dark ? this.props.theme.colors.accent : ___DONT_USE_ME_DIRECTLY___COLOR_PIN}
                    text={this.props.club.club.toString()}
                />

                {customCallout &&
                    <Callout
                        tooltip={true}
                        style={[
                            styles.callout,
                            { backgroundColor: this.props.theme.colors.surface },
                        ]}
                        onPress={this._showClub}
                    >
                        <Title numberOfLines={1} style={styles.title}>{this.props.club.name}</Title>

                        <ClubAvatar
                            theme={this.props.theme}
                            source={this.props.club.logo}
                            label={this.props.club.club.toString()}
                            size={150}
                            style={{
                                elevation: 0,
                            }}
                        />
                    </Callout>
                }
            </Marker>
        );
    }
}

export const ClubMarker = connect(null, {
    showClub,
})(withTheme(MarkerBase));


export const styles = StyleSheet.create({
    title: {
        maxWidth,
        paddingHorizontal: 8,
    },

    callout: {
        height: 190, width: 190,
        flexDirection: 'column',
        alignItems: 'center',
        elevation: 3,
    },
});
