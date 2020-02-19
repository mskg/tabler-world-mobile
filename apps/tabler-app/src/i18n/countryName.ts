
export type CountryNameFunc = (country: string | undefined | null) => string | undefined;

export const countryName = (countries): CountryNameFunc => (c) => {
    if (c == null) return null;
    return countries[c.toUpperCase()] || c;
};
