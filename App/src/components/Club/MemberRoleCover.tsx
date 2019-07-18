import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Caption, Surface, Theme, withTheme } from 'react-native-paper';
import { Categories, Logger } from '../../helper/Logger';
import { CachedImage } from '../Image/CachedImage';

const logger = new Logger(Categories.Screens.Structure);

type Props = {
    width?: number,
    style?: any,
    theme: Theme,

    // member: IMember,

    pic?: string | null,
    firstname?: string | null,
    lastname?: string | null,

    label?: string | null,
};

class MemberRoleCover extends React.Component<Props> {
    render() {
        const { style, theme, ...rest } = this.props;

        // needs to be squared
        const maxWidth = (Dimensions.get("screen").width - 16 * 2 /* padding */);

        let coverStyle = {
            height: this.props.width || maxWidth,
            width: this.props.width || maxWidth,
            backgroundColor: this.props.theme.colors.primary,
        };

        let nameStyle = {
            width: this.props.width || maxWidth,
        };

        return (
            <Surface style={styles.surface}>
                <View style={[styles.container, coverStyle, style]}>
                    <CachedImage
                        theme={this.props.theme}
                        uri={this.props.pic}
                        resizeMode="cover"
                        preview={
                            <Ionicons
                                color={this.props.theme.colors.backdrop}
                                size={coverStyle.width + 20}
                                name="ios-person" />
                        }
                        {...rest}
                        style={[styles.image, coverStyle]} />
                </View>

                <View style={[styles.name, nameStyle, { backgroundColor: this.props.theme.colors.background }]}>
                    <Caption numberOfLines={1} style={[styles.caption, { fontFamily: this.props.theme.fonts.medium }]}>
                        {this.props.firstname} {this.props.lastname}
                    </Caption>

                    {this.props.label && <Caption numberOfLines={1} style={styles.caption}>
                        {this.props.label}
                    </Caption>
                    }
                </View>
            </Surface>
        );
    }
}

const ROUNDNESS = 8;

const styles = StyleSheet.create({
    surface: {
        elevation: 2,
        borderRadius: ROUNDNESS,
    },

    container: {
        overflow: 'hidden',

        justifyContent: 'flex-end',
        alignItems: 'center',

        flexDirection: "column",

        borderTopLeftRadius: ROUNDNESS,
        borderTopRightRadius: ROUNDNESS,
    },

    caption: {
        lineHeight: 12,
    },

    name: {
        // position: 'absolute',

        // left: 0,
        // right: 0,

        // bottom: 0,
        overflow: 'hidden',
        height: 16 * 3,

        paddingHorizontal: 8,

        justifyContent: 'center',
        alignItems: 'center',

        borderBottomLeftRadius: ROUNDNESS,
        borderBottomRightRadius: ROUNDNESS,
    },

    image: {
        flex: 1,
        padding: 16,
        justifyContent: 'flex-end',
    },
});

export default withTheme(MemberRoleCover);
