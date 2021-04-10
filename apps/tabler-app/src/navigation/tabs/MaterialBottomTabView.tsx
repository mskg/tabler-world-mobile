// patched from https://github.com/react-navigation/material-bottom-tabs

import color from 'color';
import * as React from 'react';
import { ViewStyle } from 'react-native';
import { BottomNavigation, Theme, withTheme } from 'react-native-paper';
import {
    NavigationDescriptor, NavigationProp, ThemeContext
} from 'react-navigation';
import { NavigationMaterialBottomTabConfig } from './types';

type Options = {
    tabBarVisible?: boolean;
    tabBarColor?: string;
    tabBarColorLight?: string;
    tabBarColorDark?: string;
};

type Props = React.ComponentProps<typeof BottomNavigation> &
    NavigationMaterialBottomTabConfig & {
        navigation: NavigationProp<any>;
        descriptors: { [key: string]: NavigationDescriptor<any, Options> };
        screenProps?: unknown;
        renderIcon: (options: {
            route: { key: string };
            focused: boolean;
            tintColor: string;
        }) => React.ReactNode;
    } & {
        theme: Theme,
    };

class MaterialBottomTabView extends React.Component<Props> {
    static contextType = ThemeContext;

    _getColor = ({ route }: { route: { key: string } }) => {
        const { descriptors } = this.props;
        const descriptor = descriptors[route.key];
        const options = descriptor.options;

        if (this.context === 'dark' && options.tabBarColorDark) {
            return options.tabBarColorDark;
        } if (options.tabBarColorLight) {
            return options.tabBarColorLight;
        }
        return options.tabBarColor;

    }

    _getactiveColor = () => {
        const { activeColor, activeColorLight, activeColorDark } = this.props;

        if (this.context === 'dark' && activeColorDark) {
            return activeColorDark;
        } if (activeColorLight) {
            return activeColorLight;
        }
        return activeColor;

    }

    _getInactiveColor = () => {
        const { inactiveColor, inactiveColorLight, inactiveColorDark } = this.props;

        if (this.context === 'dark' && inactiveColorDark) {
            return inactiveColorDark;
        } if (inactiveColorLight) {
            return inactiveColorLight;
        }
        return inactiveColor;

    }

    _getBarStyle = () => {
        const { barStyle, barStyleLight, barStyleDark } = this.props;

        return [barStyle, this.context === 'dark' ? barStyleDark : barStyleLight];
    }

    _isVisible() {
        const { navigation, descriptors } = this.props;
        const { state } = navigation;
        const route = state.routes[state.index];
        const options = descriptors[route.key].options;
        return options.tabBarVisible;
    }

    _renderIcon = ({
        route,
        focused,
        color,
    }: {
        route: { key: string };
        focused: boolean;
        color: string;
    }) => {
        return this.props.renderIcon({ route, focused, tintColor: color });
    }

    render() {
        const {
            navigation,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            descriptors,
            ...rest
        } = this.props;

        // const activeColor = this._getactiveColor();
        let activeColor = this.props.theme.colors.accent;

        const inactiveColor = this._getInactiveColor();
        // const barStyle = this._getBarStyle();

        const contrast = color(activeColor).contrast(color(this.props.theme.colors.navigation));

        // @ts-ignore
        if (contrast < 1.5) {
            activeColor = color(activeColor).lighten(0.5).string();
        }

        const barStyle = {
            // @ts-ignore
            backgroundColor: this.props.theme.colors.navigation,
        };

        const isVisible = this._isVisible();
        const extraStyle: ViewStyle | null =
            isVisible === false
                ? {
                    display: 'none',
                    // When keyboard is shown, `position` is set to `absolute` in the library
                    // This somehow breaks `display: 'none'`, so we explcitely override `position`
                    position: undefined,
                }
                : null;

        return (
            <BottomNavigation
                // Pass these for backward compaibility
                {...rest}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
                renderIcon={this._renderIcon}
                barStyle={[barStyle, extraStyle]}
                navigationState={navigation.state}
                getColor={this._getColor}
            />
        );
    }
}

export default withTheme(MaterialBottomTabView);
