

export function parseCodeLink(path: string | null, queryParams: any) {
    if (path != null && path.endsWith('confirm') && queryParams.code != null) {
        return {
            code: queryParams.code as string,
            valid: true,
        };
    }

    return {
        valid: false,
    };
}
