// @flow
import React from 'react';
import { View } from 'react-native';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { homeScreen } from '../redux/actions/navigation';

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

    componentDidCatch(error: Error, info: { componentStack: string }) {
        console.log("***************** ERROR **************", error);

        if (typeof this.props.onError === 'function') {
            this.props.onError.call(this, error, info.componentStack)
        }
    }

    resetError: Function = () => {
        this.setState({ error: null, hasError: false })
    }

    render() {
        const { FallbackComponent } = this.props;

        return this.state.hasError
            ? <FallbackComponent
                error={this.state.error}
                resetError={this.resetError}
            />
            : this.props.children
    }
}

class GoHomeErrorBoundaryBase extends React.Component<{ homeScreen, children, navigation }> {
    render() {
        return (
            <ErrorBoundary onError={() => this.props.homeScreen()} FallbackComponent={View}>
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
                    <WrappedComponent />
                </GoHomeErrorBoundary>
            );
        }
    };
}