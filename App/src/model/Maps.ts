export type HashMap<T, K = number> = {
  [key: K]: T,
};

export type ArrayLikeHashMap<T, K = number> = {
  length: number,
  [key: K]: T,
};