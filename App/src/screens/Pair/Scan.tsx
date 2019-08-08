import { Linking } from 'expo';
import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { ActionNames } from '../../analytics/ActionNames';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { showProfile } from '../../redux/actions/navigation';

const logger = new Logger(Categories.Screens.Scan);

type Props = {
  showProfile: typeof showProfile,
};

class ScanScreenBase extends AuditedScreen<Props & NavigationInjectedProps> {
  state = {
    hasCameraPermission: null,
    visible: true,
  };

  listeners: NavigationEventSubscription[] = [];

  constructor(props: Props) {
    super(props, AuditScreenName.MemberScanQR);
  }

  async componentDidMount() {
    this.getPermissionsAsync();

    this.listeners = [
      this.props.navigation.addListener('didFocus', this._focus),
      this.props.navigation.addListener('didBlur', this._blur),
    ];

    this.audit.submit();
  }

  _focus = () => this.setState({ visible: true });
  _blur = () => this.setState({ visible: false });

  componentWillUnmount() {
    if (this.listeners) {
      this.listeners.forEach(item => item.remove());
    }
  }

  getPermissionsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    this.setState({ hasCameraPermission: status === 'granted', visible: true });
  };

  render() {
    const { hasCameraPermission } = this.state;
    if (!this.state.visible) return null;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "black",
        }}>

        {hasCameraPermission === null &&
          <Text>{I18N.Pair.request}</Text>
        }

        {hasCameraPermission === false
          ? <Text>{I18N.Pair.permission}</Text>
          : <BarCodeScanner
            onBarCodeScanned={this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}

          >
            {/* <View style={styles.layerTop} />
            <View style={styles.layerCenter}>
              <View style={styles.layerLeft} />
              <View style={styles.focused} />
              <View style={styles.layerRight} />
            </View>
            <View style={styles.layerBottom} /> */}
          </BarCodeScanner>
        }
      </View>
    );
  }

  handleBarCodeScanned: BarCodeScannedCallback = ({ type, data }) => {
    logger.log("Scanned", type, data);

    let { path, queryParams } = Linking.parse(data);
    logger.debug("path", path, "params", queryParams);

    if (path.endsWith("member") && queryParams.id != null) {
      logger.log("Member", queryParams.id);

      this.audit.trackAction(ActionNames.ReadQRCode, {
        [AuditPropertyNames.Id]: queryParams.id
      });

      this.props.showProfile(parseInt(queryParams.id, 10));
    }
  };
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

export const ScanScreen = connect(null, { showProfile })(ScanScreenBase);