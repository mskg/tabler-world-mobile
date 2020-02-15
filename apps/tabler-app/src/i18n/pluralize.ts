import { format } from './format';

type PluralMessage = {
    one: string;
    other: string;
    zero?: string;
    two?: string;
    few?: string;
    many?: string;
};

export type PluralizeFunc = (message: PluralMessage, n: number, args?: {
    [key: string]: any;
}) => string;

function append(args, nbr) {
    return args ? { ...args, number: nbr } : { number: nbr };
}

export const pluralize: PluralizeFunc = (message, n, args) => {
    if (n === 0 && message.zero) {
        return format(message.zero, append(args, n));
    }

    if (n === 1 && message.one) {
        return format(message.one, append(args, n));
    }

    if (n === 2 && message.two) {
        return format(message.two, append(args, n));
    }

    // dont' need this?
    if (n <= 10 && message.few) {
        return format(message.few, append(args, n));
    }

    if (n > 10 && message.many) {
        return format(message.many, append(args, n));
    }

    return format(message.other, append(args, n));
};
