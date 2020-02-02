import React from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import { GiftedChat, MessageContainer, InputToolbar } from 'react-native-gifted-chat';
import { IChatMessage } from './IChatMessage';

export class FixedChat extends GiftedChat<IChatMessage> {
    endReached: boolean = false;

    onSendScroll = (...args) => {
        this.onSend(...args);
        setTimeout(() => this.scrollToBottom(false), 200);
    }

    renderInputToolbar() {
        const inputToolbarProps = {
            ...this.props,
            text: this.getTextFromProp(this.state.text as unknown as string),
            composerHeight: Math.max(this.props.minComposerHeight as number, this.state.composerHeight as number),
            onSend: this.onSendScroll,
            onInputSizeChanged: this.onInputSizeChanged,
            onTextChanged: this.onInputTextChanged,
            textInputProps: {
                ...this.props.textInputProps,
                ref: (textInput) => (this.textInput = textInput),
                maxLength: this.getIsTypingDisabled() ? 0 : this.props.maxInputLength,
            },
        };

        if (this.props.renderInputToolbar) {
            return this.props.renderInputToolbar(inputToolbarProps);
        }

        return <InputToolbar {...inputToolbarProps} />;
    }

    renderMessages() {
        const { messagesContainerStyle, ...messagesContainerProps } = this.props;
        const fragment = (
            <View
                style={[
                    {
                        height: this.state.messagesContainerHeight,
                    },
                    messagesContainerStyle,
                ]}
            >
                <MessageContainer
                    {...messagesContainerProps}
                    invertibleScrollViewProps={this.invertibleScrollViewProps}
                    messages={this.getMessages()}
                    forwardRef={this._messageContainerRef}
                    listViewProps={{
                        // @ts-ignore
                        onEndReached: () => { this.endReached = true; },
                        onScroll: () => { this.endReached = false; },
                    }}
                />
                {this.renderChatFooter()}
            </View>
        );

        return this.props.isKeyboardInternallyHandled
            ? (<KeyboardAvoidingView enabled={true}>{fragment}</KeyboardAvoidingView>)
            : (fragment);
    }

    componentDidUpdate(prevProps: any = {}) {
        const { messages, text, extraData } = this.props;

        if (messages
            && prevProps.messages
            && messages.length !== prevProps.messages.length
        ) {
            this.setMessages(messages || []);

            if (this.endReached) {
                setTimeout(() => this.scrollToBottom(false), 200);
            }
        }
        // the original function has no way to update the
        // message list if data changes without adding/removing messages
        else if (extraData !== prevProps.extraData) {
            // force a redraw
            this.setMessages(messages || []);
        }

        if (text !== prevProps.text) {
            this.setTextFromProp(text);
        }
    }
}
