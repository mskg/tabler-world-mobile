export type Param_Nearby = {
    radius: number;
    days: number;

    administrativePreferences?: {
        [key: string]: {
            preferLevel: number,
        },
    }
};
