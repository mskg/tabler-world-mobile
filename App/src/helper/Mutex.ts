type VoidFunction = () => void;

/**
 * Only one Thread can rule the world.
 *
 * const unlock = await new Mutex().lock();
 * {
 *      // code that should run locked
 * }
 * unlock();
 */
export class Mutex {
    private locking: Promise<VoidFunction>;

    constructor() {
        // tslint:disable-next-line: no-empty
        this.locking = Promise.resolve((): void => {});
    }

    public lock(): Promise<VoidFunction> {
        let unlockNext: VoidFunction;

        const willLock = new Promise<VoidFunction>((resolve) => unlockNext = () => {
            resolve();
        });

        const willUnlock = this.locking.then(() => unlockNext);
        this.locking = this.locking.then(() => willLock);

        return willUnlock;
    }
}