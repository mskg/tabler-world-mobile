import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { rootSaga } from '../sagas';
import { getReduxPersistor, getReduxStore, getSagaMiddleware } from './getRedux';

export function withStore(WrappedComponent) {
  return class extends React.PureComponent {
    _runSagas = () => {
      console.log("************************** LIFT!!!!!!!!!!!!!!");
      getSagaMiddleware().run(rootSaga);
    }

    render() {
      return (<Provider store={getReduxStore()}>
        <PersistGate persistor={getReduxPersistor()} onBeforeLift={this._runSagas}>
          <WrappedComponent />
        </PersistGate>
      </Provider>);
    }
  };
}
