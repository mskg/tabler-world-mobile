export type BigDataResult = {
    latitude: number;
    longitude: number;

    localityLanguageRequested: string;

    continent: string;
    continentCode: string;

    countryName?: string;
    countryCode?: string;

    principalSubdivision?: string;

    locality?: string;
    postcode?: string;

    localityInfo: {
        administrative?: {
            order: number;
            adminLevel: number;
            name: string;
            description: string;
            isoName: string;
            isoCode: string;
            wikidataId: string;
        }[];

        informative?: {
            order: number;
            name: string;
            description?: string;
            isoCode?: string;
            wikidataId?: string;
        }[];
    };
};
