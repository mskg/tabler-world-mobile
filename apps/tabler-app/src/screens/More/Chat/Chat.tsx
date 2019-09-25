import emojiRegexCreator from 'emoji-regex';
import 'moment';
import 'moment/locale/de';
import React from 'react';
import { Platform } from 'react-native';
import { Bubble, GiftedChat, IMessage, LoadEarlier, Message } from 'react-native-gifted-chat';
import { Theme, withTheme } from 'react-native-paper';
import { Categories, Logger } from '../../../helper/Logger';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../../theme/colors';
import { BOTTOM_HEIGHT } from '../../../theme/dimensions';

const logger = new Logger(Categories.Screens.Conversation);

const emojiRegex = emojiRegexCreator();
function isPureEmojiString(text) {
    if (!text || !text.trim()) {
        return false;
    }

    return text.replace(emojiRegex, '').trim() === '';
};

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
                // @ts-ignore
                wrapperStyle={{
                    left: {
                        backgroundColor: this.props.theme.colors.background,
                    },

                    right: {
                        backgroundColor: this.props.theme.colors.accent,
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

                {...props}
            />
        );
    }

    _renderMessage = (props) => {
        const { currentMessage: { text: currText } } = props;
        let messageTextStyle = {};

        // Make "pure emoji" messages much bigger than plain text.
        if (isPureEmojiString(currText)) {
            messageTextStyle = {
                fontSize: 48,
                lineHeight: Platform.OS === 'android' ? 60 : 54,
                fontFamily: undefined,
            };
        }

        return (
            <Message
                {...props}
                textProps={{
                    style: {
                        fontFamily: this.props.theme.fonts.regular,
                        color: this.props.theme.colors.text,
                        ...messageTextStyle,
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
                isAnimated={true}

                locale="en"

                extraData={this.props.extraData}
                renderAvatar={null}
                onSend={this.props.sendMessage}
                renderMessage={this._renderMessage}

                showUserAvatar={false}
                showAvatarForEveryMessage={false}

                loadEarlier={this.props.loadEarlier}
                isLoadingEarlier={this.props.isLoadingEarlier}
                onLoadEarlier={this.props.onLoadEarlier}
                renderLoadEarlier={this._renderLoadEarlier}

                messages={this.props.messages || []}

                renderBubble={this._renderBubble}

                maxInputLength={10 * 1024}
                disableKeyboardHandling={true}
            />
        );
    }
}

export const Chat = withTheme(ChatBase);
