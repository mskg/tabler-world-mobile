import { format } from 'util';

type MetricUnit = 'pc' | 's' | 'ms' | 'μs' | 'ns';

type MetricEvent = {
    id: string,
    value: number,
    unit: MetricUnit,
};

export class Metric {
    entries: {
        [key: string]: number,
    } = {};

    list: MetricEvent[] = [];

    public async decrement(id: string, value: number = 1) {
        this.entries[id] = (this.entries[id] || 0) - value;
    }

    public async increment(id: string, value: number = 1) {
        this.entries[id] = (this.entries[id] || 0) + value;
    }

    public async set(entry: MetricEvent) {
        this.entries[entry.id] = entry.value;
    }

    public async add(entry: MetricEvent) {
        this.list.push(entry);
    }

    /**
     * We don't want lambda to play with our log messages
     */
    public async dump() {
        Object.keys(this.entries).forEach((id) => {
            process.stdout.write(
                // tslint:disable-next-line: prefer-template
                format('METRIC', id, this.entries[id], 'pc') + '\n',
            );
        });

        this.list.forEach((metric) => {
            process.stdout.write(
                // tslint:disable-next-line: prefer-template
                format('METRIC', metric.id, metric.value, metric.unit) + '\n',
            );
        });
    }
}
