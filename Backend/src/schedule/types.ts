
export enum Types {
    tabler = "tabler",
    clubs = "clubs",
}

export enum Modes {
    full = "full",
    incremental = "incremental",
}

export type Mode = keyof typeof Modes;
export type DataType = keyof typeof Types;

export type Event = {
    type: DataType;
    mode: Mode;
}

export type Data = {
    type: DataType;
    data: any[];
};

export function checkPayload(playload: any) {
    if (playload == null) {
        throw new Error("Payload must not be null");
    }

    if (playload.type !== Types.tabler && playload.type !== Types.clubs) {
        throw new Error("Invalid type " + playload.type);
    }
}