import { SplashScreen } from 'expo';
import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import Loading from '../components/Loading';
import { getReduxPersistor, getReduxStore } from './getRedux';

export function withStore(WrappedComponent) {
  return class extends React.PureComponent {
    render() {
      return (<Provider store={getReduxStore()}>
        <PersistGate loading={<Loading />} onBeforeLift={SplashScreen.hide} persistor={getReduxPersistor()}>
          <WrappedComponent />
        </PersistGate>
      </Provider>);
    }
  };
}
