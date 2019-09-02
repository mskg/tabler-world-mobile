import React from 'react';
import { Authenticator } from './Authenticator';

export function withAuthenticator(App) {
    return class extends React.PureComponent {
        render() {
            return (<Authenticator app={<App />} />);
        }
    };
}
