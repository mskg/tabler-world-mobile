import { Sentry, SentrySeverity } from 'react-native-sentry';

export class Categories {
    public static readonly Audit = "Audit";
    public static readonly App = "App";
    public static readonly Redux = "redux";
    public static readonly SagaRoot = "Saga";
    public static readonly Api = "API";
    public static readonly Authentication = "Authentication";

    private static readonly _UI = "UI";
    private static readonly _Component = "CMP";
    private static readonly _Helper = "Helper";

    public static UIComponents = class {
        public static readonly Authenticator = Categories._Component + "/Authenticator";
        public static readonly Header = Categories._Component + "/Header";
        public static readonly Cache = Categories._Component + "/PreCache";
        public static readonly WebScreen = Categories._Component + "/WebScreen";
        public static readonly Animated = Categories._Component + "/AnimatedHeader";
        public static readonly Notifications = Categories._Component + "/PushNotifications";
        public static readonly ErrorReport = Categories._Component + "/ErrorReport";
        public static readonly Linking = Categories._Component + "/Linking";
    }

    public static Sagas = class {
        public static readonly Parameters = Categories.SagaRoot + "/Parameters";
        public static readonly Settings = Categories.SagaRoot + "/Settings";
        public static readonly Member = Categories.SagaRoot + "/Member";
        public static readonly Push = Categories.SagaRoot + "/Push";
        public static readonly Location = Categories.SagaRoot + "/Location";
        public static readonly Fetch = Categories.SagaRoot + "/Fetch";
        public static readonly User = Categories.SagaRoot + "/User";
        public static readonly Contacts = Categories.SagaRoot + "/Contacts";
        public static readonly Notifications = Categories.SagaRoot + "/Notifications";
        public static readonly Snacks = Categories.SagaRoot + "/Snacks";
        public static readonly AppState = Categories.SagaRoot + "/AppState";
        public static readonly Data = Categories.SagaRoot + "/Data";
    }

    public static ReduxComponent = class {
        public static readonly Enqueue = Categories.Redux + "/enqueue";
        public static readonly Effect = Categories.Redux + "/effect";
        public static readonly Discard = Categories.Redux + "/discard";
        public static readonly FileStorage = Categories.Redux + "/FileStorage";
    }

    public static Screens = class {
        public static readonly News = Categories._UI + "/News";
        public static readonly Albums = Categories._UI + "/Albums";
        public static readonly SignIn = Categories._UI + "/SignIn";
        public static readonly ConfirmSignIn = Categories._UI + "/ConfirmSignIn";
        public static readonly Setting = Categories._UI + "/Settings";
        public static readonly Menu = Categories._UI + "/Menu";
        public static readonly Search = Categories._UI + "/Search";
        public static readonly Contacts = Categories._UI + "/Contacts";
        public static readonly Member = Categories._UI + "/Member";
        public static readonly Docs = Categories._UI + "/Docs";
        public static readonly Structure = Categories._UI + "/Structure";
        public static readonly Club = Categories._UI + "/Club";
        public static readonly Scan = Categories._UI + "/Scan";
        public static readonly NearBy = Categories._UI + "/NearBy";
    }

    public static Helpers = class {
        public static readonly DataAge = Categories._Helper + "/Query";
        public static readonly Linking = Categories._Helper + "/Linking";
        public static readonly SecureStore = Categories._Helper + "/SecureStore";
        public static readonly ImageCache = Categories._Helper + "/ImageCache";
        public static readonly Geo = Categories._Helper + "/Geo";
    }
}

let FILTER = undefined; // /Location|Redux|Nearby/ig; // /NearBy/ig; // /Location|Settings/ig; // /Push/ig; // /FileStorage/ig; // /^SAGA\/Tabler$/ig;
const MAX = 24;

// safety
if (!__DEV__) {
    FILTER = undefined;
}

export class Logger {
    private category;

    constructor(cat: string) {
        if (cat == null) {
            this.category = "Unknown";
        }
        else {
            this.category = cat;
        }
    }

    public debug(...args: any[]): void {
        //@ts-ignore
        if (FILTER != null && this.category != null && !this.category.match(FILTER)) { return };

        if (!__DEV__) {
            const message = args != null ? args[0] : null;

            let data: any = null;
            if (args != null && args.length > 1) {
                args.shift();
                data = args;
            }

            Sentry.captureBreadcrumb({
                category: this.category,
                message,
                data,
                level: SentrySeverity.Debug,
            });
        } else {
            console.debug(`[DEBUG] [${this.category.padEnd(MAX)}]`, ...args);
        }
    }

    public log(...args: any[]): void {
        //@ts-ignore
        if (FILTER != null && this.category != null && !this.category.match(FILTER)) { return };

        if (!__DEV__) {
            const message = args != null ? args[0] : null;

            let data: any = null;
            if (args != null && args.length > 1) {
                args.shift();
                data = args;
            }

            Sentry.captureBreadcrumb({
                category: this.category,
                message,
                data,
                level: SentrySeverity.Info,
            });
        } else {
            console.info(`[INFO ] [${this.category.padEnd(MAX)}]`, ...args);
        }
    }

    public error(error, ...args: any[]): void {
        if (!__DEV__) {
            Sentry.captureException(error, {
                tags: {
                    category: this.category,
                },
                extra: args,
            });
        }
        else {
            console.warn(`[ERROR] [${this.category.padEnd(MAX)}]`, ...args, error);
        }
    }
}
