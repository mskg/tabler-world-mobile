import { ApolloError } from 'apollo-client';

export class QueryFailedError extends Error {

    get nestedError(): ApolloError {
        return this._nestedError;
    }

    set nestedError(value: ApolloError) {
        this._nestedError = value;
    }

    constructor(private _nestedError: ApolloError) {
        super(_nestedError.message.replace(/GraphQL error:/i, ''));
        this.name = '';
    }
}
