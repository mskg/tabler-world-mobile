import { Ionicons } from '@expo/vector-icons';
import { ScreenOrientation } from 'expo';
import { CapturedPicture } from 'expo-camera/build/Camera.types';
import * as FileSystem from 'expo-file-system';
import * as ExpoImagePicker from 'expo-image-picker';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Clipboard, Image, KeyboardAvoidingView, Modal, Platform, Share as ShareNative, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Bubble, Composer, Message, Send, User } from 'react-native-gifted-chat';
import { IconButton, Theme, withTheme } from 'react-native-paper';
import { ImagePicker } from '../../components/ImagePicker';
import { isIphoneX } from '../../helper/isIphoneX';
import { Categories, Logger } from '../../helper/Logger';
import { I18N } from '../../i18n/translation';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../theme/colors';
import { isPureEmojiString } from './emojiRegex';
import { FixedChat } from './FixedChat';
import { IChatMessage } from './IChatMessage';
import { MessageImage } from './MessageImage';
import { resize } from './resize';

const logger = new Logger(Categories.Screens.Conversation);

const TEMP_TEXT_IMAGE = '#__#';
const IMAGE_SIZE = 100;

type Props = {
    userId: number,
    theme: Theme,

    extraData?: any,

    isLoadingEarlier: boolean,
    loadEarlier: boolean,
    onLoadEarlier: () => void,

    messages?: IChatMessage[],
    sendMessage: (messages: IChatMessage[]) => void,

    sendDisabled: boolean,

    onTextChanged?: (text: string) => void;
    onImageChanged?: (image?: string) => void;

    showUserAvatar?: boolean,
    onPressAvatar?: (user: User) => void;

    text?: string;
    image?: string;
};

type State = {
    imagePickerOpen: boolean,

    pickedImage?: {
        uri: string,
        width: number,
        height: number,
    },
};

class ChatBase extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            imagePickerOpen: false,
            pickedImage: this.props.image ?
                {
                    uri: this.props.image,
                    height: IMAGE_SIZE,
                    width: IMAGE_SIZE,
                }
                : undefined,
        };
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.image !== this.props.image) {
            this.setState({
                pickedImage: this.props.image ?
                    {
                        uri: this.props.image,
                        height: IMAGE_SIZE,
                        width: IMAGE_SIZE,
                    }
                    : undefined,
            });
        }
    }

    _renderBubble = (props: any) => {
        return (
            <Bubble
                // @ts-ignore
                wrapperStyle={{
                    left: {
                        backgroundColor: this.props.theme.colors.surface,
                    },

                    right: {
                        backgroundColor: this.props.theme.colors.accent,
                    },
                }}

                textStyle={{
                    left: {
                        color: this.props.theme.colors.text,
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
            <Send
                {...props}
                text={props.text || (this.state.pickedImage ? TEMP_TEXT_IMAGE : undefined)}
                disabled={this.props.sendDisabled}
            >
                <Ionicons
                    style={styles.sendIcon}
                    size={20}
                    name="md-send"
                    color={this.props.sendDisabled ? this.props.theme.colors.disabled : this.props.theme.colors.accent}
                />
            </Send>
        );
    }

    _renderComposer = (props) => {
        return (
            <Composer
                {...props}
                placeholder={I18N.Screen_Conversations.placeholder}
                textInputStyle={{
                    fontFamily: this.props.theme.fonts.regular,
                    lineHeight: 20,

                    marginTop: 5,
                    marginBottom: 5,
                    marginVertical: 5,

                    paddingTop: props.composerHeight >= 40 ? 0 : 4,
                }}

                // textInputAutoFocus={!this.props.sendDisabled}
                textInputProps={{
                    maxLength: 10 * 1024,
                    selectionColor: this.props.theme.colors.accent,
                    allowFontScaling: false,
                    placeholder: null,
                }}
            // disableComposer={this.props.sendDisabled}
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
        if (this.props.onImageChanged) { this.props.onImageChanged(undefined); }
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
                    logger.error('chat-export', error);
                });
        });
    }

    _onLongPress = (context: any, currentMessage: IChatMessage) => {
        if (currentMessage) {
            const options = [I18N.Screen_Conversations.copy];

            if (currentMessage.failedSend) {
                options.push(I18N.Screen_Conversations.retry);
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
            && currentMessage.user._id === this.props.userId
        ) {
            return (
                <View style={styles.tickView}>
                    {!!currentMessage.sent && (
                        <Ionicons name="md-checkmark" color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} size={10} />
                    )}
                    {!!currentMessage.received && (
                        <Ionicons name="md-checkmark" color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} size={10} />
                    )}
                    {!!currentMessage.pending && (
                        <Ionicons style={{ paddingBottom: 4 }} name="md-time" color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} size={10} />
                    )}
                </View>
            );
        }

        return null;
    }

    _renderFooter = () => {
        if (this.state.pickedImage) {
            const resized = resize(this.state.pickedImage, IMAGE_SIZE, IMAGE_SIZE);

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

    _onCameraImage = (pickedImage: CapturedPicture) => {
        logger.debug('_onCameraImage', pickedImage);

        this.setState({
            pickedImage: {
                uri: pickedImage.uri,
                height: pickedImage.height,
                width: pickedImage.width,
            },
        });

        if (this.props.onImageChanged) { this.props.onImageChanged(pickedImage.uri); }
    }

    _onGalleryImage = (pickedImage: ExpoImagePicker.ImagePickerResult) => {
        logger.debug('_onGalleryImage', pickedImage);

        if (pickedImage.cancelled) {
            this.setState({ pickedImage: undefined });
            if (this.props.onImageChanged) { this.props.onImageChanged(undefined); }
        } else {
            this.setState({
                pickedImage: {
                    uri: pickedImage.uri,
                    height: pickedImage.height,
                    width: pickedImage.width,
                },
            });

            if (this.props.onImageChanged) { this.props.onImageChanged(pickedImage.uri); }
        }
    }

    _renderActions = (props) => {
        if (props.text || this.state.pickedImage || this.props.sendDisabled) { return null; }

        return (
            <View style={styles.customActionsContainer}>
                {/* <TouchableOpacity onPress={this.openFilePicker}>
                    <View style={styles.buttonContainer}>
                        <Ionicons name="md-attach" size={23} color={this.props.theme.colors.accent} />
                    </View>
                </TouchableOpacity> */}

                <TouchableOpacity onPress={this._openPicker}>
                    <View style={styles.buttonContainer}>
                        <Ionicons name="md-image" size={23} color={this.props.theme.colors.accent} />
                    </View>
                </TouchableOpacity>
            </View>
        );
    }

    _renderMessageImage = (props) => {
        return <MessageImage {...props} />;
    }

    _openPicker = () => {
        this.setState(
            { imagePickerOpen: true },
            () => ScreenOrientation.unlockAsync(),
        );
    }

    _closePicker = () => {
        this.setState(
            { imagePickerOpen: false },
            () => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP),
        );
    }

    render() {
        return (
            <View style={{ backgroundColor: this.props.theme.colors.background, flex: 1 }}>
                <View
                    style={[styles.footer, { backgroundColor: this.props.theme.colors.primary }]}
                />

                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={this.state.imagePickerOpen}
                    onRequestClose={this._closePicker}
                >
                    <ImagePicker
                        onClose={this._closePicker}
                        onGalleryPictureSelected={this._onGalleryImage}
                        onCameraPictureSelected={this._onCameraImage}
                    />
                </Modal>

                <FixedChat
                    user={{ _id: this.props.userId }}
                    bottomOffset={isIphoneX() ? 34 : 0}

                    // style={{ height: Dimensions.get('window').height - TOTAL_HEADER_HEIGHT - BOTTOM_HEIGHT }}
                    isAnimated={true}
                    locale={I18N.id}

                    onLongPress={this._onLongPress}

                    dateFormat={'ddd D. MMM'}
                    timeFormat={'HH:mm'}

                    extraData={this.props.extraData}
                    // renderAvatar={null}
                    onSend={this._onSend}
                    renderMessage={this._renderMessage}

                    renderAvatar={!this.props.showUserAvatar ? null : undefined}
                    showUserAvatar={false}
                    showAvatarForEveryMessage={false}

                    onPressAvatar={this.props.onPressAvatar}

                    label={I18N.Screen_Conversations.loadEarlier}

                    loadEarlier={this.props.loadEarlier}
                    isLoadingEarlier={this.props.isLoadingEarlier}
                    onLoadEarlier={this.props.onLoadEarlier}
                    // renderLoadEarlier={this._renderLoadEarlier}

                    messages={this.props.messages || []}
                    // minComposerHeight={44}
                    // minInputToolbarHeight={44}

                    renderBubble={this._renderBubble}
                    maxInputLength={10 * 1024}

                    renderSend={this._renderSend}
                    renderTicks={this._renderTicks}

                    // we flip actions and composer
                    renderComposer={this._renderActions}
                    renderActions={this._renderComposer}
                    renderChatFooter={this._renderFooter}

                    renderMessageImage={this._renderMessageImage}

                    onInputTextChanged={this.props.onTextChanged}

                    text={this.props.text}
                    image={this.props.image}
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
        height: IMAGE_SIZE,
        flexDirection: 'row',
    },

    reply_to_border: {
        height: IMAGE_SIZE,
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
