export class StopWatch {
    end!: [number, number];

    constructor(
        private time = process.hrtime(),
    ) {
    }

    public start() {
        this.time = process.hrtime();
    }

    public stop() {
        this.end = process.hrtime(this.time);
        return this.elapsedS;
    }

    get elapsedYs() {
        const end = this.end || process.hrtime(this.time);
        return end[1] / 1e3;
    }

    get elapsedMS() {
        const end = this.end || process.hrtime(this.time);
        return end[1] / 1e6;
    }

    get elapsedS() {
        const end = this.end || process.hrtime(this.time);
        return end[0];
    }
}
