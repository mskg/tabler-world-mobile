import { resolvePrincipal as resolveWebPrincipal } from './lambda/resolvePrincipal';
import { resolvePrincipal as resolveWebsocketPrincipal } from './websocket/resolvePrincipal';

export * from './cognito/AuthPolicy';
export * from './cognito/downloadPems';
export { Token } from './cognito/types';
export * from './cognito/validateToken';
export * from './roles/hasRole';
export * from './sql/lookupPrincipal';
export * from './types/Family';
export * from './types/IPrincipal';
export { resolveWebsocketPrincipal, resolveWebPrincipal };

