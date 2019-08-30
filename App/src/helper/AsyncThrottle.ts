type AnyArgsFunc<T> = (...args: any[]) => Promise<T>;

/**
 * Throttles the call to the async function to maxCalls per duration.
 *
 * @param funcToThrottle The function to excute.
 * @param duration in ms
 * @param maxCalls per duration
 */
export function AsyncThrottle<T>(funcToThrottle: AnyArgsFunc<T>, duration: number, maxCalls: number = 1): AnyArgsFunc<T> {
    let processCount = 0;
    let ticks = 0;

    // throttle function
    return async function(...args: any[]) {
        return new Promise<T>((resolve, _reject) => {
            const now = Date.now();

            if ((now - ticks) > duration) {
                processCount = 1;
                ticks = now;
            } else if (processCount < maxCalls) {
                processCount++;
            } else {
                ticks += duration;
                processCount = 1;
            }

            // @ts-ignore
            setTimeout(() => { resolve(funcToThrottle.apply(this, args)); }, ticks - now);
        });
    };
}
