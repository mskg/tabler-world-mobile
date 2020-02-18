
export type FetchParameters = {
    dataUpdateInterval: number,
    task: {
        minimumInterval: number,
        startOnBoot?: boolean,
        stopOnTerminate?: boolean,
    },
};


