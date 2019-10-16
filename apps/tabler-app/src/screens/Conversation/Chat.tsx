import { Ionicons } from '@expo/vector-icons';
import emojiRegexCreator from 'emoji-regex';
import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Clipboard, Image, KeyboardAvoidingView, Platform, Share as ShareNative, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Bubble, Composer, LoadEarlier, Message, Send } from 'react-native-gifted-chat';
import { IconButton, Theme, withTheme } from 'react-native-paper';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../theme/colors';
import { FixedChat } from './FixedChat';
import { IChatMessage } from './IChatMessage';
import { resize } from './resize';

const logger = new Logger(Categories.Screens.Conversation);
const TEMP_TEXT_IMAGE = '#__#';

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

type State = {
    pickedImage?: {
        uri: string,
        width: number,
        height: number,
    },
};

class ChatBase extends React.Component<Props, State> {
    state: State = {};

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

    /**
     * Make pure emojis bigger
     */
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

    _renderSend = (props) => {
        return (
            <Send {...props} text={props.text || (this.state.pickedImage ? TEMP_TEXT_IMAGE : undefined)}>
                <Ionicons
                    style={styles.sendIcon}
                    size={20}
                    name="md-send"
                    color={this.props.theme.colors.accent}
                />
            </Send>
        );
    }

    _renderComposer = (props) => {
        return (
            <Composer
                {...props}
                textInputStyle={{
                    fontFamily: this.props.theme.fonts.regular,
                    marginVertical: 10,
                    lineHeight: 20,
                }}
            />
        );
    }

    _onSend = (messages: IChatMessage[]) => {
        if (this.state.pickedImage) {
            this.props.sendMessage([{
                ...messages[0],
                image: this.state.pickedImage.uri,
                // @ts-ignore
                text: messages[0].text !== TEMP_TEXT_IMAGE ? messages[0].text : null,
            }]);
        } else {
            this.props.sendMessage(messages);
        }

        this.setState({ pickedImage: undefined });
    }

    export(source) {
        requestAnimationFrame(() => {
            FileSystem.downloadAsync(
                source,
                `${FileSystem.cacheDirectory}share.jpeg`,
            )
                .then(({ uri }) => {
                    if (Platform.OS === 'android') {
                        Sharing.shareAsync(
                            uri,
                            {
                                mimeType: 'image/jpeg',
                                UTI: 'image/jpeg',
                            },
                        );
                    } else {
                        ShareNative.share({
                            url: uri,
                        });
                    }
                })
                .catch((error) => {
                    logger.error(error);
                });
        });
    }

    _onLongPress = (context: any, currentMessage: IChatMessage) => {
        if (currentMessage) {
            const options = [I18N.Conversations.copy];

            if (currentMessage.failedSend) {
                options.push(I18N.Conversations.retry);
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
                            if (currentMessage.text) {
                                Clipboard.setString(currentMessage.text);
                            }

                            if (currentMessage.image) {
                                this.export(currentMessage.image);
                            }
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
        if (
            currentMessage
            && (currentMessage.sent || currentMessage.received || currentMessage.pending)
            && !currentMessage.failedSend
        ) {
            return (
                <View style={styles.tickView}>
                    {!!currentMessage.sent && (
                        <Ionicons name="md-checkmark" color={this.props.theme.colors.disabled} size={10} />
                    )}
                    {!!currentMessage.received && (
                        <Ionicons name="md-checkmark" color={this.props.theme.colors.disabled} size={10} />
                    )}
                    {!!currentMessage.pending && (
                        <Ionicons name="md-time" color={this.props.theme.colors.disabled} size={10} />
                    )}
                </View>
            );
        }
        return null;
    }

    getPermissionAsync = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
        }
    }

    _renderFooter = () => {
        if (this.state.pickedImage) {
            const resized = resize(this.state.pickedImage, 100, 100);

            return (
                <View style={[styles.reply_to_footer, { backgroundColor: this.props.theme.colors.backdrop }]}>
                    <View style={[styles.reply_to_border, { backgroundColor: this.props.theme.colors.accent }]} />
                    <View style={styles.reply_to_container}>
                        <Image style={{ ...resized }} source={{ uri: this.state.pickedImage.uri }} />
                    </View>
                    <View style={styles.close_button_container}>
                        <IconButton
                            onPress={() => this.setState({ pickedImage: undefined })}
                            icon={({ size }) => <Ionicons name="md-close" size={size} color={this.props.theme.colors.accent} />}
                        />
                    </View>
                </View>
            );
        }

        return null;
    }

    _openImagePicker = async () => {
        await this.getPermissionAsync();

        const pickedImage = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            allowsMultipleSelection: false,
            exif: false,
            base64: false,
        });

        if (pickedImage.cancelled) {
            this.setState({ pickedImage: undefined });
        } else {
            this.setState({
                pickedImage: {
                    uri: pickedImage.uri,
                    height: pickedImage.height,
                    width: pickedImage.width,
                },
            });
        }
    }

    _renderActions = (props) => {
        if (props.text || this.state.pickedImage) { return null; }

        return (
            <View style={styles.customActionsContainer}>
                {/* <TouchableOpacity onPress={this.openFilePicker}>
                    <View style={styles.buttonContainer}>
                        <Ionicons name="md-attach" size={23} color={this.props.theme.colors.accent} />
                    </View>
                </TouchableOpacity> */}

                <TouchableOpacity onPress={this._openImagePicker}>
                    <View style={styles.buttonContainer}>
                        <Ionicons name="md-image" size={23} color={this.props.theme.colors.accent} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    componentDidMount() {
        if (this.props.subscribe) {
            this.props.subscribe();
        }
    }

    render() {
        return (
            <View style={{ backgroundColor: this.props.theme.colors.background, flex: 1 }}>
                <View
                    style={[styles.footer, { backgroundColor: this.props.theme.colors.primary }]}
                />

                <FixedChat
                    user={{ _id: 10430 }}
                    // bottomOffset={BOTTOM_HEIGHT}

                    // style={{ height: Dimensions.get('window').height - TOTAL_HEADER_HEIGHT - BOTTOM_HEIGHT }}
                    isAnimated={true}
                    locale={I18N.id}

                    onLongPress={this._onLongPress}

                    dateFormat={'ddd D. MMM'}
                    timeFormat={'hh:HH'}

                    extraData={this.props.extraData}
                    renderAvatar={null}
                    onSend={this._onSend}
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

                    renderSend={this._renderSend}
                    renderTicks={this._renderTicks}

                    // we flip actions and composer
                    renderComposer={this._renderActions}
                    renderActions={this._renderComposer}
                    renderChatFooter={this._renderFooter}
                />

                {Platform.OS === 'android' && <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={80} />}
            </View>

        );
    }
}

const styles = StyleSheet.create({
    sendIcon: {
        marginBottom: 12,
        marginLeft: 10,
        marginRight: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 33,
    },
    tick: {
        fontSize: 10,
    },
    tickView: {
        flexDirection: 'row',
        marginRight: 10,
    },
    customActionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonContainer: {
        padding: 10,
    },
    composer: {
        flex: 1,
    },

    reply_to_footer: {
        height: 100,
        flexDirection: 'row',
    },

    reply_to_border: {
        height: 100,
        width: 5,
    },

    reply_to_container: {
        flexDirection: 'column',
    },

    close_button_container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingRight: -5,
    },
});

export const Chat = withTheme(ChatBase);
