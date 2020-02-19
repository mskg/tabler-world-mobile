import { Family } from '../types/Family';
import { IPrincipal } from '../types/IPrincipal';
import { ITransportPrincipal } from '../types/ITransportPrincipal';
import { principalToTransport } from './principalToTransport';
import { transportToPrincipal } from './transportToPrincipal';

// @ts-ignore
// tslint:disable: no-for-in forin
// tslint:disable: mocha-no-side-effect-code

const principal = {
    area: 'area',
    association: 'association',
    club: 'club',
    email: 'email',
    id: 1,
    family: Family.RTI,
    roles: ['r1', 'r2'],
    version: '1.2',
} as IPrincipal;

const transPort = {
    area: 'area',
    association: 'association',
    club: 'club',
    email: 'email',
    id: 1,
    family: Family.RTI,
    roles: 'r1,r2',
    version: '1.2',
    principalId: 'principalId',
} as ITransportPrincipal;

describe('serialize', () => {
    test('in', () => {
        const out = principalToTransport(principal, 'principalId');
        expect(out).toStrictEqual(transPort);
    });

    test('out', () => {
        const out = transportToPrincipal(transPort);

        // @ts-ignore
        // tslint:disable-next-line: no-string-literal
        delete out['principalId'];

        expect(out).toStrictEqual(principal);
    });
});
