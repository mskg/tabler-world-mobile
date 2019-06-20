import { Linking } from "expo";
import { Audit } from "../analytics/Audit";
import { AuditEventName } from '../analytics/AuditEventName';
import { Categories, Logger } from './Logger';

const logger = new Logger(Categories.Helpers.Linking);

export enum MessagingApps {
    Default = "sms",
    WhatsApp = "whatsapp",
    // Signal = "sgnl",
    // Telegram = "tg",
}

function normalizePhone(s: string|null) {
    return s && s != "" ? s.replace(/[^\d+\+]/g, "") : null;
}

function normalizeWhatApp(s: string|null) {
    return s && s != "" ? s.replace(/^\+?0?0?/g, "") : null;
}

export const MessagingUrls = {
    [MessagingApps.WhatsApp]: (nbr) => `whatsapp://send?phone=${normalizeWhatApp(normalizePhone(nbr))}`,
    // [MessagingApps.Signal]: (nbr) => `sgnl://${normalizePhone(nbr)}`,
    // [MessagingApps.Telegram]: (nbr) => `tg://?to=${normalizePhone(nbr)}`,
    [MessagingApps.Default]: (nbr) => `sms://${normalizePhone(nbr)}`,
}

export enum WebApps {
    Default = "http",
    Chrome = "googlechrome",
}

export const WebAppUrls = {
    [WebApps.Chrome]: (url) => url.replace(/^http/i, WebApps.Chrome),
    [WebApps.Default]: (url: string) => !url.toLowerCase().startsWith("http") ? ("http://" + url) : url,
}

export enum CallApps {
    Default = "tel",
}

export const CallAppUrls = {
    [CallApps.Default]: (nbr) => `tel://${normalizePhone(nbr)}`,
}


export enum MailApps {
    Default = "mailto",
    Outlook = "ms-outlook",
    GoogleMail = "googlegmail",
}

export const MailAppUrls = {
    [MailApps.Default]: (nbr) => `mailto:${nbr}`,
    [MailApps.Outlook]: (nbr) => `ms-outlook://compose?to=${nbr}`,
    [MailApps.GoogleMail]: (nbr) => `googlegmail:///co?to=${nbr}`,
}

export class LinkingHelper {
    constructor() { }

    public static async messagingApps(): Promise<MessagingApps[]> {
        const result: any[] = [];

        for (const app of Object.keys(MessagingApps)) {
            const url = MessagingUrls[MessagingApps[app]]("+49123");
            logger.debug(app, url);

            if (__DEV__ || await Linking.canOpenURL(url)) {
                logger.debug("messagingApps true", app);
                result.push(MessagingApps[app]);
            }
        }

        return result;
    }

    public static async mailApps(): Promise<MailApps[]> {
        const result: any[] = [];

        for (const app of Object.keys(MailApps)) {
            const url = MailAppUrls[MailApps[app]]("a@a.de");
            logger.debug(app, url);

            if (__DEV__ || await Linking.canOpenURL(url)) {
                logger.debug("mailApps true", app);
                result.push(MailApps[app]);
            }
        }

        return result;
    }

    public static async callApps(): Promise<CallApps[]> {
        const result: any[] = [];

        for (const app of Object.keys(CallApps)) {
            const url = CallApps[app] + ":+49123";
            logger.debug(app, url);

            if (__DEV__ || await Linking.canOpenURL(url)) {
                logger.debug("callApps true", app);
                result.push(CallApps[app]);
            }
        }

        return result;
    }

    public static async webApps(): Promise<WebApps[]> {
        const result: any[] = [];

        for (const app of Object.keys(WebApps)) {
            const url = WebAppUrls[WebApps[app]]("https://www.tabler-world.de");
            logger.debug(app, url);

            if (__DEV__ || await Linking.canOpenURL(url)) {
                logger.debug("WebAppUrls true", app);
                result.push(WebApps[app]);
            }
        }

        return result;
    }

    public static async createSMS(app: MessagingApps | undefined, number: string) {
        const url = MessagingUrls[app || MessagingApps.Default](number);
        logger.debug(app, number, url);

        Audit.trackEvent(AuditEventName.CreateSMS, {
            app: app || MessagingApps.Default,
        });

        if (await Linking.canOpenURL(url)) {
            await Linking.openURL(url);
        } else {
            Linking.openURL(MessagingUrls[MessagingApps.Default](number));
        }
    }

    public static async openUrl(app: WebApps | undefined, urlToOpen: string) {
        const url = WebAppUrls[app || WebApps.Default](urlToOpen);
        logger.debug(app, urlToOpen, url);

        Audit.trackEvent(AuditEventName.OpenUrl, {
            app: app || WebApps.Default,
        });

        if (await Linking.canOpenURL(url)) {
            await Linking.openURL(url);
        } else {
            Linking.openURL(WebAppUrls[WebApps.Default](url));
        }
    }

    public static async makeCall(app: CallApps | undefined, party: string) {
        const url = CallAppUrls[app || CallApps.Default](party);
        logger.debug(app, party, url);

        Audit.trackEvent(AuditEventName.MakeCall, {
            app: app || CallApps.Default,
        });

        if (await Linking.canOpenURL(url)) {
            await Linking.openURL(url);
        }
    }

    public static async sendEMail(app: MailApps | undefined, party: string) {
        const url = MailAppUrls[app || MailApps.Default](party);
        logger.debug(app, party, url);

        Audit.trackEvent(AuditEventName.SendEMail, {
            app: app || MailApps.Default,
        });

        if (await Linking.canOpenURL(url)) {
            await Linking.openURL(url);
        } else {
            Linking.openURL(MailAppUrls[MailApps.Default](url));
        }
    }
}
