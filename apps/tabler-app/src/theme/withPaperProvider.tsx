
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { connect } from 'react-redux';
import { IAppState } from '../model/IAppState';
import { dark as darkTheme } from './dark';
import { getColorScheme } from './getColorScheme';
import { light as lightTheme } from './light';

class ProviderBase extends React.PureComponent<{ darkMode: boolean }> {
    subscription;
    mode = this.props.darkMode;

    _getTheme = () => {
        let scheme = getColorScheme();

        if (scheme === 'no-preference') {
            scheme = this.props.darkMode ? 'dark' : 'light';
        }

        return scheme === 'dark' ? darkTheme : lightTheme;
    }

    render() {
        return (
            <PaperProvider theme={this._getTheme()}>
                {this.props.children}
            </PaperProvider>
        );
    }
}

const Provider = connect(
    (state: IAppState) => ({
        darkMode: state.settings.darkMode,
    }))(
        ProviderBase,
    );


export function withPaperProvider(WrappedComponent) {
    let Wrapper = React.Fragment;

    if (getColorScheme() !== 'no-preference') {
        // tslint:disable-next-line: no-var-requires
        const provider = require('react-native-appearance');
        Wrapper = provider.AppearanceProvider;
    }

    return () => (
        <Wrapper>
            <Provider>
                <WrappedComponent />
            </Provider>
        </Wrapper>
    );
}
