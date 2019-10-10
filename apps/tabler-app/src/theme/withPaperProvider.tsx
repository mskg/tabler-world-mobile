
import React from 'react';
import { useColorScheme } from 'react-native-appearance';
import { Provider as PaperProvider } from 'react-native-paper';
import { connect } from 'react-redux';
import { IAppState } from '../model/IAppState';
import { dark as darkTheme } from './dark';
import { light as lightTheme } from './light';

type Props = {
    colorScheme: string,
    darkMode: boolean,
};

class ProviderBase extends React.PureComponent<Props> {
    subscription;

    constructor(props: Props) {
        super(props);
    }

    determineScheme() {
        const { colorScheme } = this.props;

        if (colorScheme === 'no-preference') {
            return this.props.darkMode ? darkTheme : lightTheme;
        }

        return colorScheme === 'dark' ? darkTheme : lightTheme;
    }

    render() {
        return (
            <PaperProvider theme={this.determineScheme()}>
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
    return () => {
        const colorScheme = useColorScheme();

        return (
            <Provider colorScheme={colorScheme}>
                <WrappedComponent />
            </Provider>
        );
    };
}
