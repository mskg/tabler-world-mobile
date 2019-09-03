export class StopWatch {
    constructor(
        private time = Date.now(),
    ) {
    }

    public start() {
        this.time = Date.now();
    }

    public stop() {
        return (Date.now() - this.time) / 1000;
    }
}
