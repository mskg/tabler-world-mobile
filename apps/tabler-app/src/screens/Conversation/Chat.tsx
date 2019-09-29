import { Ionicons } from '@expo/vector-icons';
import emojiRegexCreator from 'emoji-regex';
import 'moment';
import 'moment/locale/de';
import React from 'react';
import { Clipboard, Platform, View } from 'react-native';
import { Bubble, Composer, LoadEarlier, Message, Send } from 'react-native-gifted-chat';
import { Text, Theme, withTheme } from 'react-native-paper';
import { Categories, Logger } from '../../helper/Logger';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../theme/colors';
import { FixedChat } from './FixedChat';
import { IChatMessage } from './IChatMessage';

const logger = new Logger(Categories.Screens.Conversation);

const emojiRegex = emojiRegexCreator();
function isPureEmojiString(text) {
    if (!text || !text.trim()) {
        return false;
    }

    return text.replace(emojiRegex, '').trim() === '';
}

type Props = {
    theme: Theme,

    extraData?: any,
    isLoadingEarlier: boolean,
    loadEarlier: boolean,
    onLoadEarlier: () => void,

    messages?: IChatMessage[],
    sendMessage: (messages: IChatMessage[]) => void,
    subscribe?: () => void,
};

class ChatBase extends React.Component<Props> {
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

                isCustomViewBottom={true}
                renderCustomView={this._renderCustomView}
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

    // _renderComposer = (props) => {

    //     return (
    //         <View style={{ flexDirection: 'row' }}>
    //             <Composer {...props} />
    //             {/* <CustomImageButton />
    //             <CustomAttachButton /> */}
    //         </View>
    //     );
    // }

    _renderSend = (props) => {
        return (
            <Send {...props}>
                <Ionicons
                    style={{
                        marginBottom: 12,
                        marginLeft: 10,
                        marginRight: 10,
                    }}
                    size={20}
                    name="md-send"
                    color={this.props.theme.colors.accent}
                />
            </Send>
            // <View
            //     style={{
            //         height: 44,
            //         justifyContent: 'flex-end',
            //     }}
            // >
            //     <IconButton
            //         icon="send"
            //         color={this.props.theme.colors.accent}
            //         onPress={() => {
            //             if (text && onSend) {
            //                 onSend({ text: text.trim() }, true);
            //             }
            //         }}
            //     />
            // </View>
        );
    }

    _renderComposer = (props) => {
        return (
            // <View
            //     style={{
            //         flex: 1,
            //         borderWidth: 1,
            //         borderRadius: 16,
            //         marginRight: 10,

            //         paddingVertical: 8,
            //         height: props.composerHeight + 16,
            //     }}
            // >
            <Composer
                {...props}
                textInputStyle={{
                    fontFamily: this.props.theme.fonts.regular,
                    marginVertical: 10,
                    lineHeight: 20,
                }}
            />
            // </View>
        );
    }

    _onLongPress = (context: any, currentMessage: IChatMessage) => {
        if (currentMessage && currentMessage.text) {
            const options = ['Copy Text'];

            if (currentMessage.failedSend) {
                options.push('Retry');
            }

            options.push('Cancel');

            const cancelButtonIndex = options.length - 1;
            context.actionSheet().showActionSheetWithOptions(
                {
                    options,
                    cancelButtonIndex,
                },
                (buttonIndex) => {
                    switch (buttonIndex) {
                        case 0:
                            Clipboard.setString(currentMessage.text);
                            break;
                        case 1:
                            if (options.length === 3) {
                                this.props.sendMessage([currentMessage]);
                            }
                            break;

                        default:
                            break;
                    }
                },
            );
        }
    }

    _renderCustomView = (props) => {
        const { currentMessage } = props;

        if (currentMessage.failedSend) {
            return (
                <Ionicons
                    style={{
                        marginLeft: 10,
                        marginRight: 10,
                        marginBottom: 5,
                    }}

                    size={24}
                    name="md-alert"
                    color="red"
                />
            );
        }

        return null;
    }

    _renderTicks = (currentMessage: IChatMessage) => {
        // const { _id, sent, received } = currentMessage;
        // logger.debug('render', _id, sent, received);

        if (
            currentMessage &&
            (currentMessage.sent || currentMessage.received || currentMessage.pending)
        ) {
            return (
                <View>
                    {!!currentMessage.sent && (
                        <Text>✓</Text>
                    )}
                    {!!currentMessage.received && (
                        <Text>✓</Text>
                    )}
                    {!!currentMessage.pending && (
                        <Text>🕓</Text>
                    )}
                </View>
            );
        }
        return null;
    }

    componentWillMount() {
        if (this.props.subscribe) {
            this.props.subscribe();
        }
    }

    render() {
        logger.debug('rendering');

        return (
            <View style={{ backgroundColor: this.props.theme.colors.background, flex: 1 }}>
                <View
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: 33,
                        backgroundColor: this.props.theme.colors.primary,
                    }}
                />

                <FixedChat
                    user={{ _id: 10430 }}
                    // bottomOffset={BOTTOM_HEIGHT}

                    // style={{ height: Dimensions.get('window').height - TOTAL_HEADER_HEIGHT - BOTTOM_HEIGHT }}
                    isAnimated={true}
                    locale="en"

                    onLongPress={this._onLongPress}

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

                    // renderComposer={this._renderComposer}
                    renderSend={this._renderSend}
                    renderComposer={this._renderComposer}

                    renderTicks={this._renderTicks}
                // shouldUpdateMessage={() => true}
                />
            </View>

        );
    }
}

export const Chat = withTheme(ChatBase);
