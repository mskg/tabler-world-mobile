import * as BackgroundFetch from 'expo-background-fetch'
import { SagaIterator } from 'redux-saga';

export function* backgroundSaga(): SagaIterator {
  let result = BackgroundFetch.Result.NewData;

  // const { sync, timeout } = yield race({
  //   sync: call(fetchMembers, actions.fetchMembers()),

  //   // background fetch timeout
  //   timeout: delay(29 * 1000)
  // })

  // if (sync) { return sync; }
  // else { logger.error("Timeout occured."); }

  return result;
}
