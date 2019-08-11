import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet } from "react-native";
import { Card, Theme, Title, TouchableRipple } from 'react-native-paper';
import { connect } from 'react-redux';
import { I18N } from '../i18n/translation';
import { IWhoAmI } from '../model/IWhoAmI';
import { showPair } from '../redux/actions/navigation';
import { MeAvatar } from './MemberAvatar';

type OwnInternalProps = {
    theme: Theme,
    onPress?: any,

    title: any,
    subtitle: any,

    right?: any,

    me: IWhoAmI,
};

export const ME_ITEM_HEIGHT = 93;

export class InternalMeListItemBase extends React.PureComponent<OwnInternalProps> {
    render() {
        return (
            <Card style={styles.card}>
                <TouchableRipple onPress={this.props.onPress}>
                    <Card.Title
                        style={{ height: ME_ITEM_HEIGHT }}
                        titleStyle={styles.title}
                        subtitleStyle={styles.subTitle}

                        title={this.props.title}
                        subtitle={this.props.subtitle}
                        left={() => <MeAvatar me={this.props.me} size={48 + 16} background={this.props.theme.colors.backdrop} />}

                        rightStyle={styles.right}
                        right={this.props.right}
                    />
                </TouchableRipple>
            </Card>
        );
    }
}

type OwnProps = {
    theme: Theme,
    showPair: typeof showPair,
};

type StateProps = {
    me: IWhoAmI,
};

type Props = OwnProps & StateProps;
class MeListItemBase extends React.PureComponent<Props> {
    render() {
        const { me } = this.props;
        // const profile = getConfigValue("profile");

        return (
            <InternalMeListItemBase
                me={me}
                onPress={this.props.showPair}
                theme={this.props.theme}

                title={<Title>{me.firstname} {me.lastname}</Title>}
                subtitle={I18N.Pair.action}

                right={({ size }) => <Ionicons name="md-qr-scanner" size={size} />}
            />
        );
    }
}

export const MeListItem = connect(null, { showPair })(MeListItemBase);

const styles = StyleSheet.create({
    right: {
        marginRight: 38,
    },

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
