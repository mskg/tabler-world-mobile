import { IPrincipal } from '../types/IPrincipal';

export function isAdmin(principal: IPrincipal) {
    return principal != null && principal.id === 104301;
}
