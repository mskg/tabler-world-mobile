
import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { connect } from 'react-redux';
import { IAppState } from '../model/IAppState';
import { dark as darkTheme } from './dark';
import { light as lightTheme } from './light';

class ProviderBase extends React.PureComponent<{ darkMode: boolean }> {
    render() {
        return (
            <PaperProvider theme={this.props.darkMode ? darkTheme : lightTheme}>
                {this.props.children}
            </PaperProvider>
        );
    }
}
export const Provider = connect(
    (state: IAppState) => ({
        darkMode: state.settings.darkMode
    }),
    {
    })(ProviderBase);


export function withPaperProvider(WrappedComponent) {
    return () => <Provider><WrappedComponent /></Provider>;
}
