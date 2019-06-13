// we only take the number
export function normalizeArea(a) {
    return parseInt(a.replace(/[^0-9]/ig, ""), 10);
}

// we only take the number
export function normalizeTable(a) {
    return parseInt(a.replace(/[^0-9]/ig, ""), 10);
}