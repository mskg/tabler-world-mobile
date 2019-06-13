export function logAxiosError(logger, error, ...other: any[]) {
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        logger.error(
            {
                data: error.response.data,
                status: error.response.status,
                headers: error.response.headers,
            },
            ...other,
        );
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        logger.log("No response received for request", error.request, ...other);
    } else {
        // Something happened in setting up the request that triggered an Error
        logger.error(error, ...other);
    }
}