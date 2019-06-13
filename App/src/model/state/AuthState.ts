import { IWhoAmI } from '../IWhoAmI';

export type AuthState = {
  state: "signin" | "confirm" | "singedIn";
  signinState?: any;
  username?: string;

  user?: IWhoAmI;
};
