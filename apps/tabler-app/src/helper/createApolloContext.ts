
type Options = {
    doNotRetry?: boolean,
};

export interface IApolloContext {
    id: string;
    doNotRetry: boolean;
}

export function createApolloContext(id: string, options?: Options): IApolloContext {
    return {
        id: id.toLocaleLowerCase(),
        doNotRetry: (options && options.doNotRetry) ?? false,
    };
}
