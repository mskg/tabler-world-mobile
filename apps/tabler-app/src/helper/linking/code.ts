

export function parseCodeLink(path: string, queryParams: any) {
    if (path.endsWith('confirm') && queryParams.code != null) {
        return {
            code: queryParams.code as string,
            valid: true,
        };
    }

    return {
        valid: false,
    };
}
