export type FormatFunc = (message: string, args?: {
    [key: string]: any;
}) => string;

export const format: FormatFunc = (message, args) => {
    if (!args) {
        return message;
    }

    let result = message;

    Object.keys(args).forEach((k) => {
        result = result.replace(`{${k}}`, args[k]);
    });

    return result;
};
