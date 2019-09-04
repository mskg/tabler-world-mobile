
export type FetchParameters = {
    minimumInterval: number,
    startOnBoot: boolean,
    stopOnTerminate: boolean,
};

export const FetchParameterDefaults: FetchParameters = {
    minimumInterval: 60 * 60 * (24 / 4),
    startOnBoot: true,
    stopOnTerminate: true,
};
