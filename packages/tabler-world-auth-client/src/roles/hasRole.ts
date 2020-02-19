import { IPrincipal } from '../types/IPrincipal';

export function hasRole(principal: IPrincipal, role: string) {
    return principal != null
        && principal.roles != null
        && principal.roles.find((r) => r === role) != null;
}
