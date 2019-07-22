import { Linking } from 'expo';
import { BarCodeScannedCallback, BarCodeScanner } from 'expo-barcode-scanner';
import * as Permissions from 'expo-permissions';
import * as React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationEventSubscription, NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { showProfile } from '../../redux/actions/navigation';

const logger = new Logger(Categories.Screens.Scan);

type Props = {
  showProfile: typeof showProfile,
};

class ScanScreenBase extends React.Component<Props & NavigationInjectedProps> {
  state = {
    hasCameraPermission: null,
    visible: true,
  };

  listeners: NavigationEventSubscription[] = [];

  async componentDidMount() {
    this.getPermissionsAsync();

    this.listeners = [
      this.props.navigation.addListener('didFocus', this._focus),
      this.props.navigation.addListener('didBlur', this._blur),
    ];
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
    this.setState({ hasCameraPermission: status === 'granted' });
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
        }}>

        {hasCameraPermission === null &&
          <Text>{I18N.Pair.request}</Text>
        }

        {hasCameraPermission === false
          ? <Text>{I18N.Pair.permission}</Text>
          : <BarCodeScanner
              onBarCodeScanned={this.handleBarCodeScanned}
              style={StyleSheet.absoluteFillObject}
          />
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

      this.props.showProfile(parseInt(queryParams.id, 10));
    }
  };
}

export const ScanScreen = connect(null, { showProfile })(ScanScreenBase);