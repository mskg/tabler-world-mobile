export function isAuthenticationError(e: any): boolean {
    if (e.code === 'E_SECURESTORE_DECRYPT_ERROR') {
        return true;
    }

    if (e.code === 'ResourceNotFoundException') {
        return true;
    }

    if (e.code === 'NotAuthorizedException') {
        return true;
    }

    if (e === 'No current user') {
        return true;
    }

    return false;
}
