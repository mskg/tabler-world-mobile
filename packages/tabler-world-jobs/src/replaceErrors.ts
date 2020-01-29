// https://stackoverflow.com/questions/18391212/is-it-not-possible-to-stringify-an-error-using-json-stringify
// tslint:disable-next-line: variable-name
export function replaceErrors(_key: string, value: any) {
    if (value instanceof Error) {
        const error = {};
        Object.getOwnPropertyNames(value).forEach((k) => {
            // @ts-ignore
            error[k] = value[k];
        });
        return error;
    }
    return value;
}
