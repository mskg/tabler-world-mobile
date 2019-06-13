import { Updates } from 'expo';
import React from 'react';
import { Alert } from 'react-native';
import { connect } from 'react-redux';
import { I18N } from '../i18n/translation';
import { IAppState } from '../model/IAppState';
import { checkAppState } from '../redux/actions/state';

export class ReloaderBase extends React.Component<{showReloadDialog, checkAppState: typeof checkAppState}> {
    componentDidMount() {
        this.props.checkAppState();
    }

    componentDidUpdate(prevProps, _prevState) {
        const { showReloadDialog } = this.props;

        if (showReloadDialog === true && showReloadDialog !== prevProps.showReloadDialog) {
            Alert.alert(
                I18N.Loader.title,
                I18N.Loader.text,
                [
                    {
                        text: I18N.Loader.accept,
                        onPress: () => {
                            Updates.reloadFromCache();
                        }
                    },
                ],
                { cancelable: false }
            );
        }
    }

    render() {
        return (null);
    }
}

export default connect(
    (state: IAppState) => ({
        showReloadDialog: state.updateAvailable
    }), {
        checkAppState
    })(ReloaderBase);