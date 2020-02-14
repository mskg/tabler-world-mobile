import React from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { AuditedScreen } from '../analytics/AuditedScreen';
import { AuditScreenName } from '../analytics/AuditScreenName';
import { ScreenWithHeader } from '../components/Screen';
import { TransformableCachedImage } from '../components/TransformableCachedImage';
import { Categories, Logger } from '../helper/Logger';
import { IPictureParams } from '../redux/actions/navigation';
import { HEADER_HEIGHT } from '../theme/dimensions';

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
            <ScreenWithHeader
                header={{
                    title,
                    showBack: true,
                }}
            >
                <View style={[styles.container, { backgroundColor: this.props.theme.colors.surface }]}>
                    <TransformableCachedImage
                        uri={picture}
                        resizeMode="contain"
                        style={styles.imageActive}
                    />
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

    imageActive: {
        flex: 1,

        width: Dimensions.get('screen').width,
        height: Dimensions.get('screen').height - HEADER_HEIGHT,
    },
});
