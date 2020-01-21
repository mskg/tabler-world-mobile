import * as Sentry from 'sentry-expo';

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
        static readonly Fetch = Categories.SagaRoot + '/Fetch';
        static readonly User = Categories.SagaRoot + '/User';
        static readonly Contacts = Categories.SagaRoot + '/Contacts';
        static readonly Notifications = Categories.SagaRoot + '/Notifications';
        static readonly Snacks = Categories.SagaRoot + '/Snacks';
        static readonly AppState = Categories.SagaRoot + '/AppState';
        static readonly Data = Categories.SagaRoot + '/Data';
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
    };
}

let FILTER: RegExp | undefined = undefined; // /Chat|API/ig;
const MAX = 24;
const PRESERVE_CONSOLE = false;

// safety
if (!__DEV__) {
    FILTER = undefined;
}

export class Logger {
    private category;

    constructor(cat: string) {
        if (cat == null) {
            this.category = 'Unknown';
        } else {
            this.category = cat;
        }
    }

    debug(...args: any[]): void {
        if (FILTER != null && this.category != null && !this.category.match(FILTER)) { return; }

        if (!__DEV__ && !PRESERVE_CONSOLE) {
            const message = args != null ? args[0] : null;

            let data: any = null;
            if (args != null && args.length > 1) {
                args.shift();
                data = args;
            }

            Sentry.addBreadcrumb({
                message,
                data,

                category: this.category,
                level: Sentry.Severity.Debug,
            });
        } else {
            // tslint:disable-next-line: no-console
            console.debug(`[DEBUG] [${this.category.padEnd(MAX)}]`, ...args);
        }
    }

    log(...args: any[]): void {
        if (FILTER != null && this.category != null && !this.category.match(FILTER)) { return; }

        if (!__DEV__ && !PRESERVE_CONSOLE) {
            const message = args != null ? args[0] : null;

            let data: any = null;
            if (args != null && args.length > 1) {
                args.shift();
                data = args;
            }

            Sentry.addBreadcrumb({
                message,
                data,

                category: this.category,
                level: Sentry.Severity.Info,
            });
        } else {
            // tslint:disable-next-line: no-console
            console.info(`[INFO ] [${this.category.padEnd(MAX)}]`, ...args);
        }
    }

    error(error, ...args: any[]): void {
        if (!__DEV__ && !PRESERVE_CONSOLE) {
            Sentry.withScope((scope) => {
                scope.setLevel(Sentry.Severity.Error);
                scope.setExtra('args', args);
                scope.setTag('category', this.category);

                Sentry.captureException(error);
            });

        } else {
            // tslint:disable-next-line: no-console
            console.warn(`[ERROR] [${this.category.padEnd(MAX)}]`, ...args, error);
        }
    }
}
