import { ArrayLikeHashMap } from './Maps';

export interface IRemoteData<T> {
  data: ArrayLikeHashMap<T>;
  loading: boolean;
}
