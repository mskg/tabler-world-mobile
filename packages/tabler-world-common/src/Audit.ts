import { format } from 'util';

export type AuditEntry = {
    action: AuditAction,
    type: string,
    id: string | number,
};

type InternalAuditEntry = {
    time: string,
} & AuditEntry;

export enum AuditAction {
    Read = 'read',
}

export class Audit {
    entries: InternalAuditEntry[] = [];

    constructor(
        private requestId: string,
        private principal: string,
    ) {
    }

    public async clear() {
        this.entries = [];
    }

    public async add(entry: AuditEntry) {
        this.entries.push({
            ...entry,
            type: entry.type.replace(/ /ig, '_').toLocaleLowerCase(),
            time: new Date().toISOString(),
        });
    }

    /**
     * We don't want lambda to play with our log messages
     */
    public async dump() {
        this.entries.forEach((e) => {
            process.stdout.write(
                // tslint:disable-next-line: prefer-template
                format('AUDIT', e.time, this.requestId, this.principal, e.action, e.type, e.id) + '\n',
            );
        });

        this.clear();
    }
}
