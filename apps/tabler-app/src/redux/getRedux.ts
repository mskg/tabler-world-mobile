import { Store } from 'redux';
import { Persistor } from 'redux-persist';
import { IAppState } from '../model/IAppState';

let storeRef: any;
let persistorRef: any;
let sagaMiddlewareRef: any;

export function setReduxStore(ref) {
    storeRef = ref;
}

let rehydrationComplete: () => void;
let rehydrationFailed: () => void;

// tslint:disable-next-line: promise-must-complete
const persistorRehydratedPromise = new Promise((resolve, reject) => {
    rehydrationComplete = resolve;
    rehydrationFailed = reject;
});

export function persistorRehydrated() {
    return persistorRehydratedPromise;
}

export function setReduxPersistor(ref: Persistor) {
    persistorRef = ref;

    ref.subscribe(() => {
        const { bootstrapped } = ref.getState();

        if (bootstrapped) {
            rehydrationComplete();
        }
    });
}

export function setSagaMiddleware(ref) {
    sagaMiddlewareRef = ref;
}

/**
 * Break cycling dependencies
 */
export function getReduxStore(): Store<IAppState> {
    return storeRef;
}

/**
 * Break cycling dependencies
 */
export function getReduxPersistor() {
    return persistorRef;
}

export function getSagaMiddleware() {
    return sagaMiddlewareRef;
}
