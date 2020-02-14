export function verifyCountry(email: string) {
    if (process.env.allowed_countries === '!all') {
        return;
    }

    const allowed = process.env.allowed_countries?.split(',') || [];
    const found = allowed.find((ext) => email.endsWith(`-${ext}.roundtable.world`));

    if (!found) {
        console.error('[verifyCountry]', email, 'unkown country');
        throw new Error('"We\'re sorry, the country you entered is currently not available."');
    }
}
