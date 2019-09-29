import { GiftedChat } from 'react-native-gifted-chat';
import { IChatMessage } from './IChatMessage';

export class FixedChat extends GiftedChat<IChatMessage> {
    componentDidUpdate(prevProps: any = {}) {
        const { messages, text, extraData } = this.props;
        if (messages &&
            prevProps.messages &&
            messages.length !== prevProps.messages.length) {
            this.setMessages(messages || []);
            setTimeout(() => this.scrollToBottom(false), 200);
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
