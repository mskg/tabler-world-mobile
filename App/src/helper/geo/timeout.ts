export function timeout<T>(ms, promise: Promise<T>): Promise<T> {
    const timeoutFunc = new Promise((_resolve, reject) => {
        const id = setTimeout(
            () => {
                clearTimeout(id);
                reject(`Timed out in ${ms}ms.`);
            },
            ms);
    });

    return Promise.race([
        promise,
        timeoutFunc,
    ]) as Promise<T>;
}
