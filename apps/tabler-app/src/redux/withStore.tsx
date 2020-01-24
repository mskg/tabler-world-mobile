import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { rootSaga } from '../sagas';
import { getReduxPersistor, getReduxStore, getSagaMiddleware } from './getRedux';
import { registerForPushNotifications } from '../tasks/registerForPushNotifications';

export function withStore(WrappedComponent) {
    return class extends React.PureComponent {
        _runSagas = () => {
            getSagaMiddleware().run(rootSaga);

            // we need the saga to run
            registerForPushNotifications();
        }

        render() {
            return (
                <Provider store={getReduxStore()}>
                    <PersistGate persistor={getReduxPersistor()} onBeforeLift={this._runSagas}>
                        <WrappedComponent />
                    </PersistGate>
                </Provider>
            );
        }
    };
}
