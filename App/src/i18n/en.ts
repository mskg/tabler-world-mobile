import { Platform } from 'react-native';
import { CallApps, MailApps, MessagingApps, WebApps } from '../helper/LinkingHelper';

const countries = require("./countries/en.json");

const en = {
    Whoops: {
        title: "Whoops?",
        try: "Try Again",
        partialData: "Failed to load data from server, showing partial result",
        refresh: "Refresh"
    },

    ErrorReport: {
        title: "Report a problem",
        text: "Your feedback helps us improve TABLER.APP.",
        report: "Something isn't working?",

        subject: "TABLER.APP Issue",
        noMail: "You seem to have no mail client installed?",
        template: `Please describe what happened:`,
    },

    Image: {
        Member: "Member Info",
        Club: "Club Info"
    },

    NavigationStyle: {
        fontSize: 12,
        textAlign: 'center',
        backgroundColor: 'transparent',
    } as any,

    Loader: {
        title: "Update",
        text: "New application update were found, restart must required.",
        accept: "Accept",
    },

    SignIn: {
        placeholderEMail: "firstname.lastname@123-de.roundtable.world",
        placeholderCode: "Authorization Code",

        continue: "Login",
        confirm: "Confirm",
        cancel: "Cancel",

        welcomeBack: "Welcome back,",
        signin: "sign in to continue",
        confirmTitle: "Please confirm your login",
        checkEmail: "Check your e-mails!",
        codeWrong: "Code verification failed, you have to restart.",
        accessDenied: "You cannot use this app with your login. If you feel that this is wrong, please member the TABLER.WORLD team via e-mail.",
        codeVerify: (tries) => `Could not verify code, ${tries} tries left.`,

        demoMode: "Try the App",
        join: "How to join Round Table?",

        demo: {
            title: "Demo Mode",
            text: "After confirmation, we will restart the application. To exit the demo, goto Settings | Logout."
        }
    },

    Pair: {
        action: "Exchange contact details",
        title: "Exchange Contact Details",
        scan: "Scan Code",
        me: "My Code",

        request: "Requesting for camera permission",
        permission: "No access to camera",
    },

    Structure: {
        title: "Directory",
        associations: "Association",
        clubs: "Clubs",
        areas: "Areas",

        president: "President",

        board: "Board",
        assist: "Board Assistants",

        details: "Show Club"
    },

    Club: {
        title: "Club",

        board: "Board",
        assist: "Board Assistants",

        members: "Members",
        member: "Member",

        Actions: {
            web: "web",
            facebook: "facebook",
            instagram: "instagram",
            twitter: "twitter",
        },

        web: "Website",

        charter: "Charter Date",
        national: "National God Parent",
        international: "International God Parent",

        account: "Bank Account",

        place: (n1, n2) => n1 > 1 ? `Meeting Place ${n2}` : "Meeting Place",

        meetings: "Monthly Meetings at",
        expand: "See All"
    },

    World: {
        title: "TABLER.WORLD",
        tab: "Online"
    },

    Albums: {
        title: "Albums",
        details: "Show Album",
    },

    News: {
        title: "News",
    },

    Album: {
        title: "Album",
    },

    ReadMore: {
        more: "Read more",
        less: "Hide",
    },

    Member: {
        Menu: {
            email: "Send e-mail",
            tel: "Call",
            sms: "Send SMS",
            url: "Open web page",
            cancel: "Cancel",
        },

        Formats: {
            date: (date?: string) => {
                var dateOptions = { year: 'numeric', month: 'long', day: 'numeric' };
                return date == null
                    ? undefined
                    //@ts-ignore
                    : new Date(date).toLocaleDateString("de-de", dateOptions);
            },
        },

        email: (s) => {
            switch (s) {
                case "rt":
                    return "TABLER.WORLD";

                case "home":
                    return "Private";

                case "work":
                    return "Work";

                case "other":
                    return "Other";

                default:
                    return s;
            }
        },

        telephone: (s) => {
            switch (s) {
                case "home":
                    return "Home";

                case "mobile":
                    return "Mobile";

                case "work":
                    return "Work";

                case "other":
                    return "Other";

                default:
                    return s;
            }
        },

        Fields: {
            home: "Home Address",
            birthday: "Birthday",
            partner: "Better Half",
            roles: "RT Functions (this year)",
            rtorg: "RT Organization",

            companies: "Company",
            educations: "Education"
        },

        Actions: {
            message: "message",
            call: "call",
            mail: "mail",
            web: "tabler.world",

            openweb: "Show on TABLER.WORLD",
            favadd: "Add to Favorites",
            remfav: "Remove from Favorites",
            contact: "Update Phonebook",

            linkedin: "linkedin",
            facebook: "facebook",
            instagram: "instagram",
            twitter: "twitter",

            clipboard: "Copied text",
        },
    },

    Search: {
        title: "Search",
        history: "Search history",
        search: "Search...",
        lru: "Recently Opened",

        filter: "Filter",

        results: (r) => r > 0 ? `Search results (${r})` : "Search results",

        roles: (r) => r > 0 ? `Roles (${r})` : "Roles",
        areas: (r) => r > 0 ? `Areas (${r})` : "Areas",
        tables: (r) => r > 0 ? `Tables (${r})` : "Tables",
    },

    Filter: {
        title: "Adjust member filters",
        area: "Districts",
        showAll: "Show all members",
        hideAll: "Hide all members",

        favorites: "Favorites",
        toggleFavorits: "All favorites",
        toggleOwnTable: "My own table",

        toggleAssociationBoard: "Association Board and -Assists",
        toggleAreaBoard: "Association Board of Advisors",
    },


    Settings: {
        title: "Settings",
        logout: {
            title: "Please confirm your logout!",
            text: "We will remove all your data. This action cannot be undone.",
            button: "LOGOUT",
            demo: "You are using the app in demonstration mode. To leave this mode, please log out.",
        },

        reload: {
            title: "Reload required",
            text: "To enable that feature, we must restart the App.",
        },

        sync: {
            title: "We will remove all local data!",
            text: "This action cannot be undone.",
            date: (date: Date | null) => {
                var options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' };

                return date == null
                    ? "never"
                    : new Date(date).toLocaleString("de-de", options);
            }
        },

        apps: {
            mail: (app: MailApps) => {
                switch (app) {
                    case MailApps.Default:
                        return Platform.OS == "ios" ? "Apple Mail" : "Google Mail";

                    case MailApps.GoogleMail:
                        return "Google Mail";

                    case MailApps.Outlook:
                        return "Microsoft Outlook";

                    default:
                        return app;
                }
            },

            web: (app: WebApps) => {
                switch (app) {
                    case WebApps.Chrome:
                        return "Google Chrome";

                    case WebApps.Default:
                        return Platform.OS == "ios" ? "Safari" : "Google Chrome";

                    default:
                        return app;
                }
            },

            call: (app: CallApps) => {
                switch (app) {
                    case CallApps.Default:
                        return "Mobile Phone";

                    default:
                        return app;
                }
            },

            messaging: (app: MessagingApps) => {
                switch (app) {
                    // case MessagingApps.Signal:
                    //     return "Signal Messenger";

                    // case MessagingApps.Telegram:
                    //     return "Telegram";

                    case MessagingApps.WhatsApp:
                        return "WhatsApp";

                    case MessagingApps.Default:
                        return Platform.OS == "ios" ? "Apple Messages" : "Google Messages";

                    default:
                        return app;
                }
            },
        },

        confirm: "Confirm",
        cancel: "Cancel",

        sections: {
            about: "About",
            sync: "Update Your Phone's Addressbook",
            reset: "Reset",
            apps: "Default Apps",
            contacts: "Members",
            colors: "Colors",
            experiments: "Experiments"
        },

        texts: {
            contacts: "Members can be synchronized to your phone's default Contacts' Acccount. If members are removed from TABLER.WORLD, your contacts stay. Properties of the contacts are overriden on every change in TABLER.WORLD.",
            experiments: "These are experimental and unsupported features of the TABLER.APP and may dissapear at any time."
        },

        contactpermissions: "Cannot access Contacts. Please grant permission through the phone's settings area.",

        firstlast: "First, Last",
        lastfirst: "Last, First",

        fields: {
            mail: "Create new Mail in",
            web: "Open Browser in",
            sms: "Send Message With",
            phone: "Make Call With",
            dark: "Dark mode",
            logout: "Reset all Settings and Logout",
            clear: "Erase all Content",
            version: "Version",
            lastSync: "Last Synchronization",
            channel: "Distribution Channel",
            syncFavorites: "Synchronize Favorites",
            syncOwnTable: "Synchronize own Table's Members",
            sortOrder: "Sort Order",
            displayOrder: "Display Order",

            experiments: "Albums & News"
        },

        ReleaseNotes: "Release Notes",

        Legal: {
            title: "Legal",
            thirdparty: "Third Party Software Notices and Information",
            about: "About this App",

            docs: [
                {
                    title: "Data Protection Policy",
                    url: "https://help.roundtable.world/knowledge-base/data-protection-policy/",

                },
                {
                    title: "Imprint",
                    url: "https://help.roundtable.world/knowledge-base/imprint/"
                }
            ]
        }
    },

    Members: {
        noresults: "No data available.",
        search: "Search...",
        title: "Members",
    },

    SnackBar: {
        dismiss: "Dismiss",
        syncTablers: (m) => `Failed to refresh members (${m})`,
        syncStructure: (m) => `Failed to refresh structure (${m})`,

        error: (m) => `${m}`,
    },

    Countries: {
        translate: (c: string | undefined | null) => {
            if (c == null) return null;
            return countries.countries[c.toUpperCase()] || c;
        }
    },

    ContactSync: {
        primaryaddress: "home",
    },

    Notifications: {
        birthday: {
            title: "Birthday time",
            text: (n) => `Help ${n} to have a great day!`,
        },
    },

    Timespan: {
        now: "Now",

        seconds: "seconds",
        minutes: "minutes",
        hours: "hours",
        days: "days",
        weeks: "weeks",
        months: "months",
        years: "years",

        toOne: (s: string) => s.substring(0, -1),
    },
}

export type I18NType = typeof en;
export default en;