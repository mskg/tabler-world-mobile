// @flow
import React, { ErrorInfo } from 'react';
import { AppState } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { homeScreen } from '../redux/actions/navigation';
import { Whoops } from './Whoops';

type Props = {
    children?: React.ReactNode,
    FallbackComponent: any,
    onError?: Function
}

type State = { error: Error | null, hasError: boolean }

export class ErrorBoundary extends React.Component<Props, State> {
    state = { error: null, hasError: false }

    static getDerivedStateFromError(error: Error) {
        return { error, hasError: true }
    }

    handleAppStateChange = (nextAppState: string) => {
        if (nextAppState !== 'active') {
            return;
        }

        this.resetError();
    }

    componentWillMount() {
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }


    componentDidCatch(error: Error, _info: ErrorInfo) {
        // if (typeof this.props.onError === 'function') {
        //     this.props.onError(this.state.error);
        // } else {
        this.setState({ hasError: true, error: error });
        // }
    }

    resetError: Function = () => {
        if (typeof this.props.onError === 'function') {
            this.props.onError(this.state.error);
        } else {
            this.setState({ error: null, hasError: false });
        }
    }

    render() {
        const { FallbackComponent } = this.props;
        try {
            return this.state.hasError
                ? <FallbackComponent
                    error={this.state.error}
                    resetError={this.resetError}
                />
                : this.props.children;

        }
        catch (e) {
            return <FallbackComponent
                error={e}
                resetError={this.resetError}
            />
        }
    }
}

class GoHomeErrorBoundaryBase extends React.Component<{ homeScreen, children, navigation }> {
    render() {
        return (
            <ErrorBoundary onError={() => this.props.homeScreen()} FallbackComponent={Whoops}>
                {this.props.children}
            </ErrorBoundary>
        );
    }
}

export const GoHomeErrorBoundary = connect(null, { homeScreen })(withNavigation(GoHomeErrorBoundaryBase));

export function withGoHomeErrorBoundary(WrappedComponent) {
    return class extends React.PureComponent {
        render() {
            return (
                <GoHomeErrorBoundary>
                    <WrappedComponent {...this.props} />
                </GoHomeErrorBoundary>
            );
        }
    };
}

export function withWhoopsErrorBoundary(WrappedComponent) {
    return class extends React.PureComponent {
        render() {
            return (
                <ErrorBoundary FallbackComponent={Whoops}>
                    <WrappedComponent {...this.props} />
                </ErrorBoundary>
            );
        }
    };
}