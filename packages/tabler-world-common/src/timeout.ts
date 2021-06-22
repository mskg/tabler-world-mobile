export async function timeout<T>(promise: Promise<T>, timeoutMillis: number): Promise<T> {
    let timer: number;

    return Promise.race([
        promise,

        // tslint:disable-next-line: variable-name
        new Promise((_resolve, reject) => {
            timer = setTimeout(
                () => reject(new Error(`Timout ${timeoutMillis}`)),
                timeoutMillis,
            );
        }),
    ])
        .then(
            (v) => {
                clearTimeout(timer);
                return v as T;
            },
            (err) => {
                clearTimeout(timer);
                throw err;
            },
        );
}
