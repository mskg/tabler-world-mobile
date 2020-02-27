import { HttpQueryError } from 'apollo-server-core';

export function throw429() {
    throw new HttpQueryError(
        429,
        '{"text": "Too Many Requests"}',
        false,
    );
}
