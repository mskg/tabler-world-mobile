import Constants from 'expo-constants';
import * as Sentry from 'sentry-expo';
import { format as formatWithOptions, inspect } from 'util';

export let PRESERVE_CONSOLE = false;

export function enableConsole() {
    PRESERVE_CONSOLE = true;
}
// tslint:disable: max-classes-per-file prefer-template
export class Categories {
    static readonly Audit = 'Audit';
    static readonly App = 'App';
    static readonly Redux = 'redux';
    static readonly SagaRoot = 'Saga';
    static readonly Api = 'API';
    static readonly Authentication = 'Authentication';

    private static readonly _UI = 'UI';
    private static readonly _Component = 'CMP';
    private static readonly _Helper = 'Helper';

    static UIComponents = class {
        static readonly Authenticator = Categories._Component + '/Authenticator';
        static readonly Header = Categories._Component + '/Header';
        static readonly Cache = Categories._Component + '/PreCache';
        static readonly WebScreen = Categories._Component + '/WebScreen';
        static readonly Animated = Categories._Component + '/AnimatedHeader';
        static readonly Notifications = Categories._Component + '/PushNotifications';
        static readonly ErrorReport = Categories._Component + '/ErrorReport';
        static readonly Linking = Categories._Component + '/Linking';
        static readonly Chat = Categories._Component + '/Chat';
        static readonly ErrorBoundary = Categories._Component + '/ErrorBoundary';
    };

    static Sagas = class {
        static readonly Parameters = Categories.SagaRoot + '/Parameters';
        static readonly Settings = Categories.SagaRoot + '/Settings';
        static readonly Member = Categories.SagaRoot + '/Member';
        static readonly Push = Categories.SagaRoot + '/Push';
        static readonly Location = Categories.SagaRoot + '/Location';
        static readonly NearbyMembers = Categories.SagaRoot + '/NearbyMembers';
        static readonly Fetch = Categories.SagaRoot + '/Fetch';
        static readonly User = Categories.SagaRoot + '/User';
        static readonly Contacts = Categories.SagaRoot + '/Contacts';
        static readonly Notifications = Categories.SagaRoot + '/Notifications';
        static readonly Snacks = Categories.SagaRoot + '/Snacks';
        static readonly AppState = Categories.SagaRoot + '/AppState';
        static readonly Data = Categories.SagaRoot + '/Data';
        static readonly Chat = Categories.SagaRoot + '/Chat';
    };

    static ReduxComponent = class {
        static readonly Enqueue = Categories.Redux + '/enqueue';
        static readonly Effect = Categories.Redux + '/effect';
        static readonly Discard = Categories.Redux + '/discard';
        static readonly FileStorage = Categories.Redux + '/FileStorage';
    };

    static Screens = class {
        static readonly News = Categories._UI + '/News';
        static readonly Albums = Categories._UI + '/Albums';
        static readonly SignIn = Categories._UI + '/SignIn';
        static readonly ConfirmSignIn = Categories._UI + '/ConfirmSignIn';
        static readonly Setting = Categories._UI + '/Settings';
        static readonly Menu = Categories._UI + '/Menu';
        static readonly Search = Categories._UI + '/Search';
        static readonly SearchStructure = Categories._UI + '/SearchStructure';
        static readonly Contacts = Categories._UI + '/Contacts';
        static readonly Member = Categories._UI + '/Member';
        static readonly Docs = Categories._UI + '/Docs';
        static readonly Structure = Categories._UI + '/Structure';
        static readonly Club = Categories._UI + '/Club';
        static readonly Scan = Categories._UI + '/Scan';
        static readonly NearBy = Categories._UI + '/NearBy';
        static readonly Conversation = Categories._UI + '/Chat';
    };

    static Helpers = class {
        static readonly DataAge = Categories._Helper + '/Query';
        static readonly Linking = Categories._Helper + '/Linking';
        static readonly SecureStore = Categories._Helper + '/SecureStore';
        static readonly ImageCache = Categories._Helper + '/ImageCache';
        static readonly Geo = Categories._Helper + '/Geo';
        static readonly Chat = Categories._Helper + '/Chat';
        static readonly Badge = Categories._Helper + '/Badge';
    };
}

console.disableYellowBox = true;
let FILTER: RegExp | undefined; // /Chat|API/ig;
const MAX = 24;

// safety
if (!__DEV__) {
    FILTER = undefined;
}

export class Logger {
    private disabled;
    private category: string;

    constructor(cat: string) {
        if (cat == null) {
            this.category = 'Unknown';
        } else {
            this.category = cat;
        }

        this.disabled = FILTER && this.category.match(FILTER) == null;
    }

    /**
     * formatWithOptions is not available, such we rebuild the functionality here with one exception,
     * we don't support %s identifiers for message.
     */
    format(message: any, args: any[]) {
        let result = message;

        if (args) {
            for (const arg of args) {
                result += ' ';
                if (typeof (arg) === 'string') {
                    result += arg;
                } else {
                    result += inspect(
                        arg,
                        {
                            colors:  false,
                            maxArrayLength: 10,
                            depth: 10,
                            compact: true,
                        },
                    );
                }
            }
        }

        return result;
    }

    debug(message: any, ...args: any[]): void {
        if (this.disabled) { return; }

        const formattedMessage: string = this.format(message, args);
        if (!__DEV__ && !PRESERVE_CONSOLE) {
            Sentry.addBreadcrumb({
                message: formattedMessage,
                category: this.category,
                level: Sentry.Severity.Debug,
            });
        }

        if (__DEV__ || PRESERVE_CONSOLE) {
            // tslint:disable-next-line: no-console
            console.debug(
                Constants.installationId,
                `[DEBUG] [${this.category.padEnd(MAX)}]`,
                formattedMessage,
            );
        }
    }

    log(message: any, ...args: any[]): void {
        if (this.disabled) { return; }

        const formattedMessage: string = this.format(message, args);
        if (!__DEV__ && !PRESERVE_CONSOLE) {
            Sentry.addBreadcrumb({
                message: formattedMessage,
                category: this.category,
                level: Sentry.Severity.Debug,
            });
        }

        if (__DEV__ || PRESERVE_CONSOLE) {
            // tslint:disable-next-line: no-console
            console.log(
                Constants.installationId,
                `[INFO] [${this.category.padEnd(MAX)}]`,
                formattedMessage,
            );
        }
    }

    error(id: any, error: Error, context?: Record<string, any>, tags?: Record<string, string>): void {
        if (!__DEV__ && !PRESERVE_CONSOLE) {
            Sentry.withScope((scope) => {
                scope.setLevel(Sentry.Severity.Error);
                scope.setTag('category', this.category);
                scope.setTag('error-code', id);

                if (context) {
                    Object.keys(context).forEach((k) => {
                        scope.setExtra(k, context[k]);
                    });
                }

                if (tags) {
                    Object.keys(tags).forEach((k) => {
                        scope.setTag(k, tags[k]);
                    });
                }

                if (error.message && !error.message.match(id)) {
                    error.message = `${error.message} (cmp: ${id})`;
                }

                Sentry.captureException(error);
            });
        }

        if (__DEV__ || PRESERVE_CONSOLE) {
            // we don't use error, das this would result in React to force a crash
            console.warn(
                Constants.installationId,
                `[ERROR] [${this.category.padEnd(MAX)}]`,
                `[${id}]`,
                error,
                context,
            );
        }
    }
}
