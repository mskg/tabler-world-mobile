import React from 'react';
import { StyleSheet } from "react-native";
import { Card, Theme, Title, TouchableRipple } from 'react-native-paper';
import { getConfigValue } from '../helper/Configuration';
import { OpenLink } from "../helper/OpenLink";
import { I18N } from '../i18n/translation';
import { IWhoAmI } from '../model/IWhoAmI';
import { MeAvatar } from './MemberAvatar';

type State = {
};

type OwnProps = {
    theme: Theme,
};

type StateProps = {
    me: IWhoAmI,
};

type Props = OwnProps & StateProps;

export const ME_ITEM_HEIGHT = 93;

export class MeListItem extends React.PureComponent<Props, State> {
    render() {
        const { me } = this.props;
        const profile = getConfigValue("profile");

        return (
            <Card style={styles.card}>
                <TouchableRipple onPress={() => OpenLink.url(profile.replace("#id#", me.id.toString())) }>
                    <Card.Title
                        style={{height: ME_ITEM_HEIGHT}}
                        titleStyle={styles.title}
                        subtitleStyle={styles.subTitle}

                        title={<Title>{me.firstname} {me.lastname}</Title>}
                        subtitle={I18N.Members.me}
                        left={() => <MeAvatar me={this.props.me} size={48 + 16} background={this.props.theme.colors.backdrop} />}
                    />
                </TouchableRipple>
            </Card>
        );
    }
}

const styles = StyleSheet.create({
    card: {
        height: ME_ITEM_HEIGHT,
        paddingVertical: 0,

        alignItems: "center",
        flexDirection: "row",
        width: "100%",
    },

    title: {
        marginLeft: 24,
        minHeight: 22,
        lineHeight: 22,
        marginVertical: 0,
    },

    subTitle: {
        marginLeft: 24,
        lineHeight: 14,
        minHeight: 13
    },

    headLine: {
        marginVertical: 0,
        lineHeight: 26,
    },

    headerContainer: {
        flexDirection: "row",
        padding: 10,
    },

    text: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        marginHorizontal: 16,
        marginVertical: 12,
    },
});
