import { Families } from '../../theme/getFamilyColor';

export type AuthState = {
    state: 'signin' | 'confirm' | 'singedIn';
    signinState?: any;
    username?: string;
    accentColor?: Families;
    // user?: IWhoAmI;
};
