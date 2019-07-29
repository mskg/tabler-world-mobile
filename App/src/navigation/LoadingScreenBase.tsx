import React from 'react';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { IAppState } from '../model/IAppState';

/**
 * This might not work in DEV, if redux persits the navigation
 */
class LoadingScreenBase extends React.Component<NavigationInjectedProps & { experiments }>
{
    constructor(props) {
        super(props);

        this.props.navigation.navigate(this.props.experiments === true ? "Experiments" : "Normal");
    }
    render() {
        // should not happen heree
        return null;
    }
}

export const LoadingScreen = connect((s: IAppState) => ({ experiments: s.settings.experiments }))(LoadingScreenBase);
