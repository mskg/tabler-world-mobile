import { Theme } from "react-native-paper"

declare module "aws-amplify-react-native" {
    export type Props = {
        authState?: string;
        authData?: string;
        onStateChange?: (state: string, data?: string) => void;
    }

    export type State = {
        // authState: string;
        // authData: string;
        error?: string | null;
    }

    export type AuthenticatorState = {
        authState?: string;
        authData?: string;
        error?: string | null;
    }

    export class AuthPiece<P, S> extends React.Component<P & Props, S & State> {
        _validAuthStates: string[];
        _isHidden: boolean;

        changeState(state: string, data?: string);
        checkContact(user: any);
        error(err);
        showComponent(theme: any): ReactNode;
    }

    export function withAuthenticator(
        Comp,
        includeGreetings = false,
        authenticatorComponents?: any[],
        federated?,
        theme?,
        signUpConfig?
    )
}