import * as zlib from 'zlib';

export function gzipAsync(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.gzip(data, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

export function gunzipAsync(data: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        zlib.gunzip(data, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}
