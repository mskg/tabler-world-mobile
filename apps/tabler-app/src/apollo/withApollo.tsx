import { ApolloClient } from 'apollo-client';
import React from 'react';
import { ApolloProvider } from 'react-apollo';
import { AsyncStorage } from 'react-native';
import { isDemoModeEnabled } from '../helper/demoMode';
import { Categories, Logger } from '../helper/Logger';
import { Features, isFeatureEnabled } from '../model/Features';
import { bootstrapApollo, getApolloCachePersistor } from './bootstrapApollo';

const logger = new Logger(Categories.Api);

const SCHEMA_VERSION = '5'; // Must be a string.
const SCHEMA_VERSION_KEY = 'apollo-schema-version';

type State = {
    client?: ApolloClient<any>,
};

export function withApollo(App) {
    return class extends React.PureComponent<{}, State> {
        async componentDidMount() {
            const client = await bootstrapApollo({
                demoMode: await isDemoModeEnabled(),
                noWebsocket: !isFeatureEnabled(Features.Chat),
            });

            const persistor = getApolloCachePersistor();

            try {
                const currentVersion = await AsyncStorage.getItem(SCHEMA_VERSION_KEY);

                if (currentVersion === SCHEMA_VERSION) {
                    // We're good to go and can restore the cache.
                    await persistor.restore();
                } else {
                    // We'll want to purge the outdated persisted cache
                    await persistor.purge();
                    await AsyncStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
                }

                await persistor.restore();
            } catch (e) {
                logger.error(e, 'Failed to restore cache');

                try {
                    persistor.purge();
                    await AsyncStorage.setItem(SCHEMA_VERSION_KEY, SCHEMA_VERSION);
                    // tslint:disable-next-line: no-empty
                } catch { }
            }

            this.setState({ client });
            logger.log('Loaded Apollo.');
        }

        render() {
            const { client } = this.state || {};

            if (client == null) {
                logger.log('Apollo not loaded yet.');
                return null;
            }

            return (
                <ApolloProvider client={client}>
                    <App />
                </ApolloProvider>
            );
        }
    };
}
