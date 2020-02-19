import { Camera } from 'expo-camera';
import * as Permissions from 'expo-permissions';
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ActionNames } from '../../analytics/ActionNames';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { HandleScreenState } from '../../components/HandleScreenState';
import { FullScreenLoading } from '../../components/Loading';
import { EmptyComponent } from '../../components/NoResults';
import { parseLink } from '../../helper/linking/parseLink';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { addFavorite, removeFavorite } from '../../redux/actions/filter';
import { showProfile } from '../../redux/actions/navigation';
import { addSnack } from '../../redux/actions/snacks';

const logger = new Logger(Categories.Screens.Scan);

type Props = {
    showProfile: typeof showProfile,
    addSnack: typeof addSnack,
    removeFavorite: typeof removeFavorite
    addFavorite: typeof addFavorite
    theme: Theme,
};

class ScanScreenBase extends AuditedScreen<Props & NavigationInjectedProps> {
    state = {
        hasCameraPermission: null,
        visible: true,
    };

    constructor(props: Props) {
        super(props, AuditScreenName.MemberScanQR);
    }

    componentDidMount() {
        super.componentDidMount();
        this.getPermissionsAsync();
    }

    _focus = () => {
        logger.debug('_focus');
        this.setState({ visible: true });
    }

    _blur = () => {
        logger.debug('_blur');
        this.setState({ visible: false });
    }

    getPermissionsAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA);
        this.setState(
            { hasCameraPermission: status === 'granted', visible: true },
            () => this.forceUpdate(),
        );
    }

    render() {
        const { hasCameraPermission } = this.state;

        return (
            <View
                style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    backgroundColor: hasCameraPermission
                        ? 'black'
                        : this.props.theme.colors.background,
                }}
            >
                <HandleScreenState
                    onBlur={this._blur}
                    onFocus={this._focus}
                />

                {hasCameraPermission === null &&
                    <EmptyComponent title={I18N.Screen_Pair.request} />
                }

                {hasCameraPermission === false
                    ? <EmptyComponent title={I18N.Screen_Pair.permission} />
                    : this.state.visible
                        ? (
                            <Camera
                                onBarCodeScanned={this.handleBarCodeScanned}
                                style={StyleSheet.absoluteFillObject}
                            // flashMode="torch"
                            />
                        )
                        : <FullScreenLoading />
                }
            </View>
        );
    }

    handleBarCodeScanned = ({ type, data }) => {
        logger.log('Scanned', type, data);

        const { path, queryParams } = parseLink(data);
        logger.debug('path', path, 'params', queryParams);

        if (queryParams && path && path.endsWith('member') && queryParams.id != null) {
            logger.log('Member', queryParams.id);

            this.audit.trackAction(ActionNames.ReadQRCode, {
                [AuditPropertyNames.Id]: queryParams.id,
            });

            this.props.addFavorite({ id: parseInt(queryParams.id, 10) });
            this.props.showProfile(parseInt(queryParams.id, 10));
            this.props.addSnack({
                message: I18N.Screen_Pair.remove,
                action: {
                    label: I18N.Screen_Pair.undo,
                    onPress: () => this.props.removeFavorite({ id: parseInt(queryParams.id || '0', 10) }),
                },
            });
        }
    }
}

// const opacity = 'rgba(0, 0, 0, .6)';
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: 'column'
//   },
//   layerTop: {
//     flex: 0.5,
//     backgroundColor: opacity
//   },

//   layerCenter: {
//     flex: 1,
//     flexDirection: 'row'
//   },

//   layerLeft: {
//     flex: 1,
//     backgroundColor: opacity
//   },

//   focused: {
//     flex: 10
//   },

//   layerRight: {
//     flex: 1,
//     backgroundColor: opacity
//   },

//   layerBottom: {
//     flex: 0.5,
//     backgroundColor: opacity
//   },
// });

export const ScanScreen = connect(null, { showProfile, addSnack, removeFavorite, addFavorite })(withTheme(ScanScreenBase));
