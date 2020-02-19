import { IPrincipal } from '../types/IPrincipal';

export function transportToPrincipal(transport: any): IPrincipal {
    const ser: any = {
        ...transport,
    };

    if (transport.roles) {
        ser.roles = transport.roles.split(',');
    }

    return ser as IPrincipal;
}
