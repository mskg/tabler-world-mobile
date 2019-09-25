import 'moment';
import 'moment/locale/de';
import React from 'react';
import { Bubble, GiftedChat, IMessage, LoadEarlier } from 'react-native-gifted-chat';
import { Theme, withTheme } from 'react-native-paper';
import { Categories, Logger } from '../../../helper/Logger';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../../theme/colors';
import { BOTTOM_HEIGHT } from '../../../theme/dimensions';

const logger = new Logger(Categories.Screens.Conversation);

type Props = {
    theme: Theme,

    extraData?: any,
    isLoadingEarlier: boolean,
    loadEarlier: boolean,
    onLoadEarlier: () => void,

    messages?: IMessage[],
    sendMessage: (messages: IMessage[]) => void,
    subscribe: () => void,
};

class ChatBase extends React.Component<Props> {
    ref: any;

    componentWillMount() {
        this.props.subscribe();
    }

    _renderLoadEarlier = (props: any) => {
        logger.log('loadEarlier', this.props.loadEarlier, 'isLoadingEarlier', this.props.isLoadingEarlier);

        return (
            <LoadEarlier {...props} />
        );
    }

    _renderBubble = (props: any) => {
        return (
            <Bubble
                {...props}

                // @ts-ignore
                wrapperStyle={{
                    left: {
                        backgroundColor: this.props.theme.colors.background,
                    },

                    right: {
                        backgroundColor: this.props.theme.colors.accent,
                    },
                }}

                // @ts-ignore
                textProps={{
                    style: {
                        fontFamily: this.props.theme.fonts.regular,
                    },
                }}

                timeTextStyle={{
                    left: {
                        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
                    },
                    right: {
                        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
                    },
                }}

                textStyle={{
                    left: {
                        color: this.props.theme.colors.text,
                        fontSize: 13,
                    },
                    right: {
                        color: this.props.theme.colors.text,
                        fontSize: 13,
                    },
                }}
            />
        );
    }

    render() {
        return (
            <GiftedChat
                user={{ _id: 10430 }}
                bottomOffset={BOTTOM_HEIGHT}

                locale="en"

                extraData={this.props.extraData}
                renderAvatar={null}
                onSend={this.props.sendMessage}

                showUserAvatar={false}
                showAvatarForEveryMessage={false}

                loadEarlier={this.props.loadEarlier}
                isLoadingEarlier={this.props.isLoadingEarlier}
                onLoadEarlier={this.props.onLoadEarlier}
                renderLoadEarlier={this._renderLoadEarlier}

                messages={this.props.messages || []}

                renderBubble={this._renderBubble}
            />
        );
    }
}

export const Chat = withTheme(ChatBase);
