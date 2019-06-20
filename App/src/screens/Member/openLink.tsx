import { CallApps, LinkingHelper, MailApps, MessagingApps, WebApps } from '../../helper/LinkingHelper';
import { OpenLink } from '../../helper/OpenLink';

export enum LinkType {
    Internet = 1,
    Phone = 2,
    Message = 3,
    EMail = 4
}

export function openLinkWithApp(protocol: LinkType, app: string, text: string) {
    switch (protocol) {
        case LinkType.EMail:
            LinkingHelper.sendEMail(app as MailApps, text);
            break;

        case LinkType.Internet:
            LinkingHelper.openUrl(app as WebApps, text);
            break;

        case LinkType.Message:
            LinkingHelper.createSMS(app as MessagingApps, text);
            break;

        case LinkType.Phone:
            LinkingHelper.makeCall(app as CallApps, text);
            break;
    }
}

export async function openLinkWithDefaultApp(type: LinkType, url: string) {
    switch (type) {
        case LinkType.Internet:
            OpenLink.url(url);
            break;

        case LinkType.EMail:
            OpenLink.email(url);
            break;

        case LinkType.Phone:
            OpenLink.call(url);
            break;

        case LinkType.Message:
            OpenLink.sms(url);
            break;
    }
}
