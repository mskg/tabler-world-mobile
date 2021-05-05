import { Theme } from 'react-native-paper';


export type AppTheme = Theme & {
    colors: {
        notification: string;
        navigation: string;
    };
};
