// tslint:disable-next-line: function-name
export async function AsyncPool<P = any, R = any>(poolLimit: number, array: P[], iteratorFn: (e: P, array: P[]) => Promise<R>): Promise<R[]> {
    const ret = [];
    const executing: Promise<any>[] = [];

    for (const item of array) {
        const runner = Promise.resolve().then(() => iteratorFn(item, array));
        ret.push(runner);

        const cleanup: Promise<any> = runner.then(
            () => executing.splice(executing.indexOf(cleanup), 1));

        executing.push(cleanup);

        if (executing.length >= poolLimit) {
            await Promise.race(executing);
        }
    }

    return Promise.all(ret);
}
