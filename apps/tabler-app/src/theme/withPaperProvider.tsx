
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
    accentColor: string,
};

class ProviderBase extends React.PureComponent<Props> {
    subscription;

    constructor(props: Props) {
        super(props);
    }

    getBaseSchema() {
        const { colorScheme } = this.props;

        if (colorScheme === 'no-preference') {
            return this.props.darkMode ? darkTheme : lightTheme;
        }

        return colorScheme === 'dark' ? darkTheme : lightTheme;
    }

    determineScheme() {
        const s = this.getBaseSchema();
        s.colors.accent = this.props.accentColor;

        return s;
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
        accentColor: state.auth.accentColor,
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
