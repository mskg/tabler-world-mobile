import { CallApps, MailApps, MessagingApps, WebApps } from '../helper/LinkingHelper';
import { IAppState } from '../model/IAppState';

export const INITIAL_STATE: IAppState = {
  connection: {
    effectiveType: "unknown",
    type: "unknown",
    offline: false,
  },

  updateAvailable: false,

  snacks: [],

  auth: {
    state: "signin",
    username: undefined,
    signinState: undefined,
  },

  location: {
    track: false,
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

      showAreaBoard: false,
      showAssociationBoard: false,

      area: [],
      favorites: {},
    }
  }
};
