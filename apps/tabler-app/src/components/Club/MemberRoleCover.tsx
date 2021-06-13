import { Ionicons } from '@expo/vector-icons';
import * as React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Caption, Surface, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { IAppState } from '../../model/IAppState';
import { CachedImage } from '../Image/CachedImage';

// const logger = new Logger(Categories.Screens.Structure);

type Props = {
    width?: number,
    style?: any,
    theme: Theme,

    // member: IMember,

    pic?: string | null,
    firstname?: string | null,
    lastname?: string | null,

    diplayFirstNameFirst: boolean,
    sortByLastName: boolean,

    label?: string | null,
};

class MemberRoleCover extends React.Component<Props> {
    render() {
        const { style, theme, ...rest } = this.props;

        // needs to be squared
        const maxWidth = (Dimensions.get('window').width - 16 * 2);

        const coverStyle = {
            height: this.props.width || maxWidth,
            width: this.props.width || maxWidth,
            backgroundColor: this.props.theme.colors.primary,
        };

        const nameStyle = {
            width: this.props.width || maxWidth,
        };

        return (
            <Surface style={styles.surface}>
                <View style={[styles.container, coverStyle, style]}>
                    <CachedImage
                        uri={this.props.pic}
                        resizeMode="cover"
                        cacheGroup="avatar"
                        preview={
                            <View style={[styles.container, coverStyle]}>
                                <Ionicons
                                    color={this.props.theme.colors.backdrop}
                                    size={coverStyle.width * 88 / 94} // icon is not squared
                                    // style={{ marginTop: -10 }}
                                    style={{ paddingTop: -20 }}
                                    name="md-person" />
                            </View>
                        }
                        {...rest}
                        style={[styles.image, coverStyle]} />
                </View>

                <View style={[styles.name, nameStyle, { backgroundColor: this.props.theme.colors.background }]}>
                    <Caption numberOfLines={1} style={[styles.caption, { fontFamily: this.props.theme.fonts.medium }]}>
                        {
                            this.props.diplayFirstNameFirst ?
                                `${this.props.firstname} ${this.props.lastname}`
                                : `${this.props.lastname} ${this.props.firstname}`
                        }
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

        flexDirection: 'column',

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

// tslint:disable-next-line: export-name
export default withTheme(
    connect((state: IAppState) => ({
        diplayFirstNameFirst: state.settings.diplayFirstNameFirst,
        sortByLastName: state.settings.sortByLastName,
    }))(MemberRoleCover),
);
