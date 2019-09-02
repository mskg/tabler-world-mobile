
import { createNavigationReducer, createReactNavigationReduxMiddleware, createReduxContainer } from 'react-navigation-redux-helpers';
import { connect } from 'react-redux';
import AppNavigator from './Root';

const navReducer = createNavigationReducer(AppNavigator);

const middleware = createReactNavigationReduxMiddleware(
    // @ts-ignore
    state => state.navigation,
);

const App = createReduxContainer(AppNavigator);
const mapStateToProps = (state) => ({
    state: state.navigation,
});

const AppWithNavigationState = connect(mapStateToProps)(App);

export { navReducer, middleware as navMiddleware, AppWithNavigationState as Navigation };

