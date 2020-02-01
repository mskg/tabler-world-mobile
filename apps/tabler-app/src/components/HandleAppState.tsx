// @flow
import React from 'react';
import { AppState } from 'react-native';

type Props = {
    triggerOnFirstMount?: boolean,
    triggerOnUnmount?: boolean,

    onActive?: () => void,
    onInactive?: () => void,
};

export class HandleAppState extends React.PureComponent<Props> {
    _handleAppStateChange = (nextAppState: string) => {
        if (nextAppState !== 'active') {
            if (this.props.onInactive) { this.props.onInactive(); }
        } else {
            if (this.props.onActive) { this.props.onActive(); }
        }
    }

    componentDidMount() {
        AppState.addEventListener('change', this._handleAppStateChange);

        if (this.props.triggerOnFirstMount) {
            if (this.props.onActive) { this.props.onActive(); }
        }
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this._handleAppStateChange);

        if (this.props.triggerOnUnmount) {
            if (this.props.onInactive) { this.props.onInactive(); }
        }
    }

    render() { return null; }
}
