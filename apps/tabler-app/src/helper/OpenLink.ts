import { IAppState } from '../model/IAppState';
import { getReduxStore } from '../redux/getRedux';
import { CallApps, LinkingHelper, MailApps, MessagingApps, WebApps } from './LinkingHelper';

function state(): IAppState {
    return (getReduxStore().getState() as IAppState);
}

// tslint:disable: function-name
export class OpenLink {

    static canSendMessage() {
        return state().settings.messagingApp != null;
    }

    static sms(number: string) {
        const app = state().settings.messagingApp;

        if (app != null) {
            LinkingHelper.createSMS(
                app as MessagingApps,
                number);
        }
    }

    static canOpenUrl() {
        return state().settings.browserApp != null;
    }

    static url(url: string) {
        const app = state().settings.browserApp;

        if (app != null) {
            LinkingHelper.openUrl(
                app as WebApps,
                url,
            );
        }
    }

    static canCall() {
        return state().settings.phoneApp != null;
    }

    static call(nbr: string) {
        const app = state().settings.phoneApp;

        if (app != null) {
            LinkingHelper.makeCall(
                app as CallApps,
                nbr,
            );
        }
    }

    static canEmail() {
        return state().settings.emailApp != null;
    }

    static email(recipient: string) {
        const app = state().settings.emailApp;

        if (app != null) {
            LinkingHelper.sendEMail(
                app as MailApps,
                recipient);
        }
    }
}
