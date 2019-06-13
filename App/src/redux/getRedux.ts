let storeRef: any;
let persistorRef: any;
let sagaMiddlewareRef: any;

export function setReduxStore(ref) {
    storeRef = ref;
}

export function setReduxPersistor(ref) {
    persistorRef = ref;
}

export function setSagaMiddleware(ref) {
    sagaMiddlewareRef = ref;
}

/**
 * Break cycling dependencies
 */
export function getReduxStore() {
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