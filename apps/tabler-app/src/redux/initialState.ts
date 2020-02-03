import { CallApps, MailApps, MessagingApps, WebApps } from '../helper/LinkingHelper';
import { IAppState } from '../model/IAppState';
import { NetInfoStateType } from '@react-native-community/netinfo';

// tslint:disable-next-line: export-name
export const INITIAL_STATE: IAppState = {
    connection: {
        // effectiveType: 'unknown',
        type: NetInfoStateType.unknown,
        isConnected: false,
        isInternetReachable: false,

        offline: true,
        // required for demo mode
        websocket: true,

        details: null,
    },

    updateAvailable: false,

    snacks: [],

    auth: {
        state: 'signin',
        username: undefined,
        signinState: undefined,
    },

    location: {
    },

    searchHistory: {
        members: ['Markus Kling'],
        structure: ['RT129 Böblingen/Sindelfingen'],
        lru: [],
    },

    settings: {
        syncFavorites: false,
        syncOwnTable: false,
        sortByLastName: true,
        diplayFirstNameFirst: true,

        messagingApp: MessagingApps.Default,
        browserApp: WebApps.Default,
        phoneApp: CallApps.Default,
        emailApp: MailApps.Default,

        darkMode: false,
        optOutAnalytics: false,

        notificationsBirthdays: true,
        notificationsOneToOneChat: true,
    },

    filter: {
        member: {
            showFavorites: true,
            showOwntable: true,

            showAreaBoard: false,
            showAssociationBoard: false,

            area: [],
            favorites: {},
        },
    },

    chat: {
        badge: 0,
        activeConversation: null,
        pendingSend: [],
        lastEdits: {},
    },
};
