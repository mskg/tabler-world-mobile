import { ServerError } from 'apollo-link-http-common';

export function extract429Details(error: any) {
    const serverError = (error?.networkError || error) as ServerError;

    if (serverError && serverError.statusCode === 429) {
        if (serverError?.response?.headers?.get) {
            const retry = parseInt(serverError.response.headers.get('x-retry-after') ?? '0', 10);

            if (!isNaN(retry) && retry > 0) {
                return {
                    is429: true,
                    retryAfter: retry,
                };
            }
        }

        return {
            is429: true,
        };
    }

    return { is429: false };
}
