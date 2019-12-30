

export function parseMemberLink(path: string | null, queryParams: any) {
    if (path != null && path.endsWith('member') && queryParams.id != null) {
        return {
            id: parseInt(queryParams.id, 10),
            valid: true,
        };
    }

    return {
        valid: false,
    };
}
