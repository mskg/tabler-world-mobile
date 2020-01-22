
const getScreenRegisteredFunctions = (navState) => {
    // When we use stack navigators.
    // Also needed for react-navigation@2
    const { routes, index, params } = navState;

    if (navState.hasOwnProperty('index')) {
        return getScreenRegisteredFunctions(routes[index]);
    }
    // When we have the final screen params

    return params;
};

// tslint:disable-next-line: export-name
export const defaultNavigationOptions = ({ navigation }) => ({
    tabBarOnPress: ({ defaultHandler }) => {
        if (navigation && navigation.isFocused()) {
            const screenFunctions = getScreenRegisteredFunctions(navigation.state);

            if (screenFunctions && typeof screenFunctions.tapOnTabNavigator === 'function') {
                screenFunctions.tapOnTabNavigator();
            }
        }

        // Always call defaultHandler()
        defaultHandler();
    },
});

export type TapOnNavigationParams = {
    tapOnTabNavigator: () => void,
};
