import { FetchParameters } from '../types/Fetch';

export const Fetch: FetchParameters = {
    dataUpdateInterval: 60 * (24 / 4),
    task: {
        minimumInterval: 60 * 60, // 15 min. consumes too much battery
        startOnBoot: true,
        stopOnTerminate: false,
    },
};
