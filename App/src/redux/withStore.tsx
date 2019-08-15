import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { getReduxPersistor, getReduxStore } from './getRedux';

export function withStore(WrappedComponent) {
  return class extends React.PureComponent {
    render() {
      return (<Provider store={getReduxStore()}>
        <PersistGate persistor={getReduxPersistor()}>
          <WrappedComponent />
        </PersistGate>
      </Provider>);
    }
  };
}
