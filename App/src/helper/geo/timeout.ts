export function timeout<T> (ms, promise: Promise<T>): Promise<T> {

  let timeout = new Promise((resolve, reject) => {
    let id = setTimeout(() => {
      clearTimeout(id);
      reject('Timed out in ' + ms + 'ms.');
    }, ms);
  });

  return Promise.race([
    promise,
    timeout
  ]);
};
