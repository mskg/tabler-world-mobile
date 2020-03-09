import { onConnect } from './onConnect';
import { onDefault } from './onDefault';
import { onDisconnect } from './onDisconnect';
import { ProtocolContext } from './ProtocolContext';
import { Routes } from './Routes';

export type ProtocolFunc = (context: ProtocolContext) => Promise<void>;

// tslint:disable-next-line: export-name
export { ProtocolContext } from './ProtocolContext';

// tslint:disable-next-line: variable-name
export const SubscriptionsTransportWSProtocol = {
    [Routes.connect]: onConnect as ProtocolFunc,
    [Routes.disconnect]: onDisconnect as ProtocolFunc,
    [Routes.default]: onDefault as ProtocolFunc,
};
