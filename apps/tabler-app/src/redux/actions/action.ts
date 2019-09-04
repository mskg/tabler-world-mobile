import { Action as BaseAction } from 'redux';

export interface IAction<Type extends string, Payload> extends BaseAction {
    // tslint:disable-next-line:no-reserved-keywords type is the accepted Action discriminator in redux actions
    type: Type;
    payload: Payload;
}

export interface IActionCreator<Type extends string, Payload> {
    (payload?: Payload): IAction<Type, Payload>;
    // tslint:disable-next-line:no-reserved-keywords Field names used by the greater redux community
    type: Type;
    shape: IAction<Type, Payload>;
}

export function createAction<Type extends string, Payload = void>(type: Type): IActionCreator<Type, Payload> {
    const action = ((payload: Payload): IAction<Type, Payload> => {
        return { type, payload };
    }) as IActionCreator<Type, Payload>;
    action.type = type;
    return action;
}
