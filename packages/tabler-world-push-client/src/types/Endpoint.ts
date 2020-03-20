
export enum EndpointType {
    ios = 'ios',
    android = 'android',
}

export type Endpoint = {
    type: EndpointType;
    deviceid: string;
    token: string;
};
