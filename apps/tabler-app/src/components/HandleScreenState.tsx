// @flow
import React from 'react';
import { NavigationEventSubscription, NavigationInjectedProps, withNavigation } from 'react-navigation';

type Props = {
    triggerOnFirstMount?: boolean,
    triggerOnUnmount?: boolean,
    ignoreMountedState?: boolean,

    onFocus?: () => void,
    onBlur?: () => void,
};

class HandleScreenStateBase extends React.PureComponent<Props & NavigationInjectedProps> {
    mounted: boolean = true;
    listeners: NavigationEventSubscription[] = [];

    componentDidMount() {
        this.mounted = true;

        this.listeners = [
            this.props.navigation.addListener('didFocus', this._focus),
            this.props.navigation.addListener('didBlur', this._blur),
        ];

        if (this.props.triggerOnFirstMount) {
            this._focus();
        }
    }

    // this way, the background updates are stopped
    _focus = () => {
        if ((this.mounted || this.props.ignoreMountedState) && this.props.onFocus) {
            this.props.onFocus();
        }
    }

    _blur = () => {
        if ((this.mounted || this.props.ignoreMountedState) && this.props.onBlur) {
            this.props.onBlur();
        }
    }

    componentWillUnmount() {
        this.mounted = false;

        for (const listener of this.listeners) {
            listener.remove();
        }

        if (this.props.triggerOnUnmount) {
            this._blur();
        }
    }

    render() { return null; }
}

export const HandleScreenState = withNavigation(HandleScreenStateBase);
