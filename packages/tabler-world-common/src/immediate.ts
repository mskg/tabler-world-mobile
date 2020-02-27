export async function immediate<T>(promise: Promise<T>, timeoutMillis: number): Promise<T> {
    let timer: NodeJS.Immediate;

    return Promise.race([
        promise,

        // tslint:disable-next-line: variable-name
        new Promise((_resolve, reject) => {
            timer = setImmediate(
                () => reject(new Error(`Timout ${timeoutMillis}`)),
                timeoutMillis,
            );
        }),
    ])
        .then(
            (v) => {
                clearImmediate(timer);
                return v as T;
            },
            (err) => {
                clearImmediate(timer);
                throw err;
            },
        );
}
