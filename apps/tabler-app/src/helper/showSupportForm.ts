import { UrlParameters } from '@mskg/tabler-world-config-app';
import Constants from 'expo-constants';
import * as MailComposer from 'expo-mail-composer';
import { Alert, Platform } from 'react-native';
import { ActionNames } from '../analytics/ActionNames';
import { Audit } from '../analytics/Audit';
import { AuditScreenName } from '../analytics/AuditScreenName';
import { cachedAolloClient } from '../apollo/bootstrapApollo';
import { getParameterValue } from '../helper/parameters/getParameterValue';
import { I18N } from '../i18n/translation';
import { ParameterName } from '../model/graphql/globalTypes';
import { Me } from '../model/graphql/Me';
import { GetMeQuery } from '../queries/Member/GetMeQuery';
import { isSignedIn } from '../tasks/helper/isSignedIn';
import { createApolloContext } from './createApolloContext';
import { Categories, Logger } from './Logger';

const logger = new Logger(Categories.UIComponents.ErrorReport);
const audit = Audit.screen(AuditScreenName.ErrorReport);

export async function showSupportForm() {
    try {
        const urls = await getParameterValue<UrlParameters>(ParameterName.urls);

        let supportUrl = urls.support.global;
        let country = 'global';

        if (isSignedIn()) {
            try {
                const client = cachedAolloClient();

                const me = await client.query<Me>({
                    query: GetMeQuery,
                    fetchPolicy: 'cache-first',
                    context: createApolloContext('showSupportForm'),
                });

                country = me.data?.Me?.association?.id || country;
            } catch (e) {
                logger.log(e);
            }
        }

        if (country != null) {
            country = urls.support[country] ? country : 'global';
            supportUrl = urls.support[country];
        }

        const result = await MailComposer.composeAsync({
            subject: `${I18N.Component_ErrorReport.subject} (${country})`,
            isHtml: true,
            body: `${I18N.Component_ErrorReport.template}

------------------------------
Platform: ${Platform.OS} v${Platform.Version}
App Version: ${Constants.nativeAppVersion}
Build Version: ${Constants.manifest.version}
Device Id: ${Constants.deviceId}
Time: ${new Date().toISOString()}
`.replace(/\n/ig, '<br/>'),
            recipients: [supportUrl],
        });

        audit.trackAction(ActionNames.SendErrorReport, {
            Result: result.status,
        });
    } catch (e) {
        audit.trackAction(ActionNames.SendErrorReport, {
            Result: 'Error',
        });

        logger.error('error-report', e);
        Alert.alert(I18N.Component_ErrorReport.noMail);
    }
}
