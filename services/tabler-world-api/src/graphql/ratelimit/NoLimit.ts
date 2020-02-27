import { IRateLimiter } from './IRateLimiter';

export class NoLimit implements IRateLimiter {
    use() {
        return Promise.resolve({
            limit: 0,
            remaining: 0,
            rejected: false,
            retryDelta: 0,
            forced: false,
        });
    }
}
