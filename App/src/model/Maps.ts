export type HashMap<T, K = number> = {
   //@ts-ignore
   [key: K]: T,
};

export type ArrayLikeHashMap<T, K = number> = {
  length: number,
  //@ts-ignore
  [key: K]: T,
};