import { CallApps, MailApps, MessagingApps, WebApps } from '../helper/LinkingHelper';
import { IAppState } from '../model/IAppState';

export const INITIAL_STATE: IAppState = {
  updateAvailable: false,

  // offline: {
  //   busy: false,
  //   lastTransaction: -1,
  //   online: true,
  //   outbox: [],
  //   retryCount: 0,
  //   retryScheduled: false
  // },

  snacks: [],

  auth: {
    state: "signin",
    username: undefined,
    signinState: undefined,
    //@ts-ignore
    user: {
      id: 0,
    },
  },

  searchHistory: {
    members: ["Markus Kling"],
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
  },

  filter: {
    member: {
      showFavorites: true,
      showOwntable: true,
      area: null,
      favorites: {},
    }
  }
};
