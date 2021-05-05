
import React from 'react';
import { useColorScheme } from 'react-native-appearance';
import { Provider as PaperProvider } from 'react-native-paper';
import { connect } from 'react-redux';
import { IAppState } from '../model/IAppState';
import { AppTheme } from './AppTheme';
import { determineTheme, updateTheme } from './theming';

type Props = {
    colorScheme: string,
    darkMode: boolean,
    accentColor: string,
};

type State = {
    theme: AppTheme;
};

class ProviderBase extends React.PureComponent<Props, State> {
    subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            theme: ProviderBase.calcScheme(props),
        }
    }

    // tslint:disable-next-line: function-name
    static calcScheme(props: Props) {
        return updateTheme(
            determineTheme(
                props.colorScheme, props.darkMode,
            ),
            props.accentColor,
        );
    }

    // tslint:disable-next-line: function-name
    static getDerivedStateFromProps(props: Props, _state?: State) {
        return {
            theme: ProviderBase.calcScheme(props),
        };
    }

    render() {
        return (
            <PaperProvider theme={this.state.theme}>
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
