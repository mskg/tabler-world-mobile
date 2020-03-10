export type SettingsState = {
    syncFavorites: boolean;
    syncOwnTable: boolean;
    sortByLastName: boolean;
    diplayFirstNameFirst: boolean;

    messagingApp?: string;
    browserApp?: string;
    phoneApp?: string;
    emailApp?: string;

    darkMode: boolean;
    experiments?: boolean;
    optOutAnalytics: boolean;

    nearbyMembers?: boolean;
    nearbyMembersMap?: boolean;

    hideOwnClubWhenNearby?: boolean;

    supportsNotifications: boolean;
    notificationsBirthdays?: boolean;
    notificationsOneToOneChat?: boolean;
};
