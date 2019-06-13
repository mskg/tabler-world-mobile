import React from 'react';
import { View } from 'react-native';
import { Theme } from 'react-native-paper';
import { ActionButton } from '../../components/ActionButton';
import { OpenLink } from '../../helper/OpenLink';
import { I18N } from '../../i18n/translation';
import { GetMemberQueryType_SocialMedia } from './Queries';
import { styles } from './Styles';

export const Social = ({ social, theme }: { social: GetMemberQueryType_SocialMedia | undefined, theme: Theme }) => {
    if (social == null) { return null; }
    if (!social.facebook
        && !social.instagram
        && !social.linkedin
        && !social.twitter) { return null; }

    return (
        <View style={styles.actions}>
            <ActionButton
                text={I18N.Member.Actions.facebook}
                size={32}
                onPress={() => OpenLink.url(social.facebook as string)}
                icon="logo-facebook"
                color={theme.colors.accent}
                disabled={!OpenLink.canOpenUrl() || social.facebook == null}
                disabledColor={theme.colors.disabled} />

            <ActionButton
                text={I18N.Member.Actions.instagram}
                size={32}
                onPress={() => OpenLink.url(social.instagram as string)}
                icon="logo-instagram"
                color={theme.colors.accent}
                disabled={!OpenLink.canOpenUrl() || social.instagram == null}
                disabledColor={theme.colors.disabled}
            />

            <ActionButton
                text={I18N.Member.Actions.twitter}
                size={32}
                onPress={() => OpenLink.url(social.twitter as string)}
                icon="logo-twitter"
                color={theme.colors.accent}
                disabled={!OpenLink.canOpenUrl() || social.twitter == null}
                disabledColor={theme.colors.disabled} />

            <ActionButton
                text={I18N.Member.Actions.linkedin}
                size={32}
                onPress={() => OpenLink.url(social.linkedin as string)}
                icon="logo-linkedin"
                color={theme.colors.accent}
                disabled={!OpenLink.canOpenUrl() || social.linkedin == null}
                disabledColor={theme.colors.disabled} />
        </View>
    );
}