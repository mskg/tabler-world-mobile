import { Theme } from 'react-native-paper';


export type AppTheme = Theme & {
    colors: {
        textOnAccent: string;
        notification: string;
        navigation: string;
    };
};
