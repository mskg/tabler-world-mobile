import { IAppState } from "../model/IAppState";
import { getReduxStore } from "../redux/getRedux";
import { CallApps, LinkingHelper, MailApps, MessagingApps, WebApps } from "./LinkingHelper";

function state(): IAppState {
    return (getReduxStore().getState() as IAppState);
}

export class OpenLink {

    public static canSendMessage() {
        return state().settings.messagingApp != null;
    }

    public static sms(number: string) {
        const app = state().settings.messagingApp;

        if (app != null) {
            LinkingHelper.createSMS(
                app as MessagingApps,
                number);
        }
    }

    public static canOpenUrl() {
        return state().settings.browserApp != null;
    }

    public static url(url: string) {
        const app = state().settings.browserApp;

        if (app != null) {
            LinkingHelper.openUrl(
                app as WebApps,
                url);
        }
    }

    public static canCall() {
        return state().settings.phoneApp != null;
    }

    public static call(number: string) {
        const app = state().settings.phoneApp;

        if (app != null) {
            LinkingHelper.makeCall(
                app as CallApps,
                number);
        }
    }

    public static canEmail() {
        return state().settings.emailApp != null;
    }

    public static email(recipient: string) {
        const app = state().settings.emailApp;

        if (app != null) {
            LinkingHelper.sendEMail(
                app as MailApps,
                recipient);
        }
    }
}
