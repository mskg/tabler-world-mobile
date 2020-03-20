import { IPrincipal } from '@mskg/tabler-world-auth-client';
import { Endpoint } from '@mskg/tabler-world-push-client';

export type Payload = {
    action: 'register' | 'unregister';
    principal: IPrincipal;
    endpoint: Endpoint;
};
