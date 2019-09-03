export interface ISnack {
    message: string;
    duration?: number;

    hideAction?: boolean;

    action?: {
        label: string
        onPress: () => void,
    };
}
