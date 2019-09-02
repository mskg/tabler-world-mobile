import React from 'react';
import { StyleSheet, View } from 'react-native';
import { withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../analytics/AuditedScreen';
import { AuditScreenName } from '../analytics/AuditScreenName';
import { CachedImage } from '../components/Image/CachedImage';
import { ScreenWithHeader } from '../components/Screen';
import { Categories, Logger } from '../helper/Logger';
import { IPictureParams } from '../redux/actions/navigation';

const logger = new Logger(Categories.UIComponents.WebScreen);

export class PictureScreenBase extends AuditedScreen<{ theme } & NavigationInjectedProps<IPictureParams>> {
    ref: any;

    constructor(props) {
        super(props, AuditScreenName.Picture);
    }

    render() {
        const { title, picture } = this.props.navigation.state.params as IPictureParams;
        logger.debug('url', picture);

        return (
            <ScreenWithHeader header={{
                title,
                showBack: true,
            }}>
                <View style={[styles.container, { backgroundColor: this.props.theme.colors.surface }]}>
                    <CachedImage
                        uri={picture}
                        resizeMode="contain" />
                </View>
            </ScreenWithHeader>
        );
    }
}

export const PictureScreen = withTheme(withNavigation(PictureScreenBase));

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',

        position: 'relative',
        flex: 1,
    },
});
