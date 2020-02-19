import { IPrincipal } from '../types/IPrincipal';
import { ITransportPrincipal } from '../types/ITransportPrincipal';

/**
 * Lambda Authorizer only supports
 * - String
 * - Number
 * - Boolean
 *
 * And no undefined/null values.
 */
export function principalToTransport(p: IPrincipal, principalId: string): ITransportPrincipal {
    const ser: any = {
        ...p,
    };

    // we remove undefined values
    Object.keys(ser).forEach((k) => {
        if (!ser[k]) {
            delete ser[k];
        }
    });

    if (p.roles) {
        ser.roles = p.roles.join(',');
    }

    ser.principalId = principalId;
    return ser as ITransportPrincipal;
}
