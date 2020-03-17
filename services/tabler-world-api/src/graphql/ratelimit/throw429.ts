import { HttpQueryError } from 'apollo-server-core';

export const HEADER_KEY = 'x-retry-after';

export function throw429(retryAfter: number) {
    throw new HttpQueryError(
        429,
        `{"text": "Too Many Requests", "${HEADER_KEY}": ${retryAfter}}`,
        false,
        retryAfter !== 0
            ? {
                [HEADER_KEY]: retryAfter.toString(),
            }
            : undefined,
    );
}
