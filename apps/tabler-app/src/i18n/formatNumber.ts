
export type FormatNumberFunc = (nbr: number) => string;

export const formatNumber = (locale: string): FormatNumberFunc => (c: number) => c.toLocaleString(locale);
