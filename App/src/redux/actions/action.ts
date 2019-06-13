import { Action as BaseAction } from 'redux';

export interface Action<Type extends string, Payload> extends BaseAction {
    // tslint:disable-next-line:no-reserved-keywords type is the accepted Action discriminator in redux actions
    type: Type;
    payload: Payload;
}

export interface ActionCreator<Type extends string, Payload> {
    (payload?: Payload): Action<Type, Payload>;
    // tslint:disable-next-line:no-reserved-keywords Field names used by the greater redux community
    type: Type;
    shape: Action<Type, Payload>;
}

export function createAction<Type extends string, Payload = void>(type: Type): ActionCreator<Type, Payload> {
    const action = ((payload: Payload): Action<Type, Payload> => {
        return { type, payload };
    }) as ActionCreator<Type, Payload>;
    action.type = type;
    return action;
}
