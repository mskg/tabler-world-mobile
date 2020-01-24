
export class ClientLostError extends Error {
    public get connectionId() {
        return this.cId;
    }

    constructor(private cId: string) {
        super(`Connection to ${cId} has been lost (410).`);
        this.name = 'ClientLostError';
    }
}
