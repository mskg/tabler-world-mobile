
export type FetchParameters = {
    dataUpdateInterval: number,
    task: {
        minimumInterval: number,
        startOnBoot?: boolean,
        stopOnTerminate?: boolean,
    },
};

export const FetchParameterDefaults: FetchParameters = {
    dataUpdateInterval: 60 * (24 / 4),
    task: {
        minimumInterval: 60 * 15,
        startOnBoot: true,
        stopOnTerminate: false,
    },
};
