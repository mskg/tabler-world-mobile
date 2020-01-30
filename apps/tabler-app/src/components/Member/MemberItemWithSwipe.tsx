import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Theme, TouchableRipple } from 'react-native-paper';
import { connect } from 'react-redux';
import { cachedAolloClient } from '../../apollo/bootstrapApollo';
import { Features, isFeatureEnabled } from '../../model/Features';
import { CanMemberChat } from '../../model/graphql/CanMemberChat';
import { IAppState } from '../../model/IAppState';
import { IMemberOverviewFragment } from '../../model/IMemberOverviewFragment';
import { HashMap } from '../../model/Maps';
import { GetCanMemberChatQuery } from '../../queries/Member/GetCanMemberChatQuery';
import { toggleFavorite } from '../../redux/actions/filter';
import { startConversation } from '../../redux/actions/navigation';
import { FavoriteIcon } from '../FavoriteButton';
import { SwipableItem, SwipeButtonsContainer } from '../SwipableItem';
import { MemberListItem } from './MemberListItem';

type Props = {
    item: IMemberOverviewFragment;
    theme: Theme;
    onPress?: (item: IMemberOverviewFragment) => void;
    margin?: number;
    height?: number;

    email?: string,
    chat: boolean,
    favorites: HashMap<boolean>,
    toggleFavorite: typeof toggleFavorite,
    startConversation: typeof startConversation,
};

type State = {
    canChat: boolean,
};

const testIsFavorite = (member: IMemberOverviewFragment, favorites: HashMap<boolean>) => {
    return favorites[member.id] === true;
};

export class MemberItemWithSwipeBase extends React.Component<Props, State> {
    ref;

    state = {
        canChat: false,
    };

    getSnapshotBeforeUpdate(prevProps) {
        if (prevProps.item !== this.props.item) {
            return true;
        }

        return false;
    }

    componentDidUpdate(_prevProps, _prevState, snapshot) {
        if (snapshot && this.ref) {
            if (this.ref) { this.ref.close(); }
            this.setState({ canChat: false });
        }
    }

    _right = ({ size }) => (
        <FavoriteIcon
            theme={this.props.theme}
            member={this.props.item}
            style={{ marginRight: this.props.margin }}
            size={size}
        />
    )

    _toggle = () => {
        requestAnimationFrame(() => {
            this.props.toggleFavorite(this.props.item);
            if (this.ref) { this.ref.close(); }
        });
    }

    _chat = () => {
        requestAnimationFrame(() => {
            this.props.startConversation(
                this.props.item.id,
                `${this.props.item.firstname} ${this.props.item.lastname}`,
            );

            if (this.ref) { this.ref.close(); }
        });
    }

    _checkChat = async () => {
        if (!isFeatureEnabled(Features.Chat) || !this.props.chat) {
            return;
        }

        const client = cachedAolloClient();
        const result = await client.query<CanMemberChat>({
            query: GetCanMemberChatQuery,
            variables: {
                id: this.props.item.id,
            },
            fetchPolicy: 'cache-first',
        });

        if (result.data.Member?.availableForChat) {
            this.setState({ canChat: true });
        }
    }

    // tslint:disable-next-line: max-func-body-length
    render() {
        const { item, favorites } = this.props;
        const isFavorite = testIsFavorite(item, favorites);

        return (
            <SwipableItem
                ref={(o) => { this.ref = o; }}
                onRightButtonsShowed={this._checkChat}

                leftButtons={(
                    <SwipeButtonsContainer
                        style={{
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                        }}
                    >
                        <TouchableRipple
                            onPress={this._toggle}
                            style={{
                                height: '100%',
                                width: 24 * 3,
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: this.props.theme.colors.accent,
                            }}
                        >
                            <Ionicons
                                size={24}
                                name={isFavorite ? 'md-star-outline' : 'md-star'}
                                color={this.props.theme.colors.placeholder}
                            />
                        </TouchableRipple>
                    </SwipeButtonsContainer>
                )}

                rightButtons={
                    (!isFeatureEnabled(Features.Chat) || !this.props.chat)
                        ? undefined
                        : (
                            <SwipeButtonsContainer
                                style={{
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexDirection: 'row',
                                }}
                            >
                                <TouchableRipple
                                    onPress={this._chat}
                                    disabled={!this.state.canChat}
                                    style={{
                                        height: '100%',
                                        width: 24 * 4,
                                        paddingLeft: 24,
                                        paddingRight: 24,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        backgroundColor: this.props.theme.colors.background,
                                    }}
                                >
                                    <Ionicons
                                        size={24}
                                        name={'md-chatbubbles'}
                                        color={this.state.canChat ?
                                            this.props.theme.colors.accent
                                            : this.props.theme.colors.disabled
                                        }
                                    />
                                </TouchableRipple>
                            </SwipeButtonsContainer>
                        )
                }

            // rightButtons={
            //     <SwipeButtonsContainer style={{
            //         alignItems: 'center',
            //         justifyContent: 'center',
            //         flexDirection: 'row',
            //         // backgroundColor: this.props.theme.colors.b,
            //     }}>
            //         <TouchableRipple
            //             onPress={() => { }}
            //             style={{
            //                 height: "100%",
            //                 width: 24 * 2,
            //                 alignItems: 'center',
            //                 justifyContent: 'center',
            //                 backgroundColor: this.props.theme.colors.accent,
            //             }}
            //         >
            //             <Ionicons size={24} name="md-call" color={this.props.theme.colors.placeholder} />
            //         </TouchableRipple>

            //         <TouchableRipple
            //             onPress={() => { }}
            //             style={{
            //                 height: "100%",
            //                 width: 24 * 2,
            //                 alignItems: 'center',
            //                 justifyContent: 'center',
            //                 backgroundColor: this.props.theme.colors.accent,
            //             }}
            //         >
            //             <Ionicons size={24} name="md-chatbubbles" color={this.props.theme.colors.placeholder} />
            //         </TouchableRipple>

            //         <TouchableRipple
            //             onPress={() => { }}
            //             style={{
            //                 height: "100%",
            //                 width: 24 * 2 + 24,
            //                 paddingRight: 24,
            //                 alignItems: 'center',
            //                 justifyContent: 'center',
            //                 backgroundColor: this.props.theme.colors.accent,
            //             }}
            //         >
            //             <Ionicons size={24} name="md-mail" color={this.props.theme.colors.placeholder} />
            //         </TouchableRipple>
            //     </SwipeButtonsContainer>
            // }
            >
                <MemberListItem
                    height={this.props.height}
                    theme={this.props.theme}
                    onPress={this.props.onPress}
                    member={this.props.item}
                    margin={this.props.margin}
                    right={this._right}
                />
            </SwipableItem>
        );
    }
}


export const MemberItemWithSwipe = connect(
    (state: IAppState) => ({
        favorites: state.filter.member.favorites,
        chat: state.settings.notificationsOneToOneChat == null || state.settings.notificationsOneToOneChat,
        email: state.auth.username,
    }),
    {
        toggleFavorite,
        startConversation,
    },
)(MemberItemWithSwipeBase);
