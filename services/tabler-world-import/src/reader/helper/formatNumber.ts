/**
 * Format number to string with leading 0
 */
export function formatNumber(d: number) {
    return d < 10 ? "0" + d.toString() : d.toString();
}
