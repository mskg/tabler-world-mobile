import React from 'react';
import { Portal, Snackbar } from 'react-native-paper';
import { connect, MapStateToProps } from 'react-redux';
import { I18N } from '../i18n/translation';
import { IAppState } from '../model/IAppState';
import { ISnack } from '../model/ISnacks';
import { shiftSnack } from '../redux/actions/snacks';
import { BOTTOM_HEIGHT } from '../theme/dimensions';

type State = {
    visible: boolean,
};

type OwnProps = {
};

type StateProps = {
    snacks: ISnack[],
};

type DispatchPros = {
    shiftSnack: typeof shiftSnack;
};

type Props = OwnProps & StateProps & DispatchPros;

export class SnacksBase extends React.Component<Props, State> {
    mounted = false;

    constructor(props) {
        super(props);
        this.state = { visible: this.props.snacks.length > 0 };
    }

    componentDidMount() {
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    componentDidUpdate(prevProps) {
        if (prevProps.snacks !== this.props.snacks) {
            // give time to fade-in
            setTimeout(() => {
                // need to check if component is still there
                // there will be a couple of issues when we throw away state due to
                // authentication errors
                if (this.mounted) {
                    this.setState({
                        visible: this.props.snacks.length > 0,
                    });
                }
            }, 200);
        }
    }

    _onDismiss = () => {
        this.setState({ visible: false },
            // give enough time to hide, before render update
            () => setTimeout(
                () => this.props.shiftSnack(), 100));
    }

    render() {

        const snack = this.props.snacks && this.props.snacks.length > 0 ? this.props.snacks[0] : undefined;
        if (!snack) return null;

        return (
            <Portal>
                <Snackbar
                    style={{ bottom: BOTTOM_HEIGHT + 10 }}
                    visible={this.state.visible}
                    onDismiss={this._onDismiss}
                    duration={snack.duration || Snackbar.DURATION_MEDIUM}

                    action={snack.action
                        ? snack.action
                        : snack.hideAction
                            ? undefined
                            : {
                                label: I18N.SnackBar.dismiss,
                                onPress: () => { },
                            }}>

                    {snack.message}
                </Snackbar>
            </Portal>
        );
    }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, IAppState> = (state: IAppState): StateProps => {
    return {
        snacks: state.snacks,
    };
};

export const Snacks = connect(
    mapStateToProps, {
    shiftSnack,
})(SnacksBase);
