
export type HashMap<T, K = number> = {
    // @ts-ignore string | numnber
    [key: K]: T,
};

export type ArrayLikeHashMap<T, K = number> = {
    length: number,
    // @ts-ignore string | numnber
    [key: K]: T,
};
