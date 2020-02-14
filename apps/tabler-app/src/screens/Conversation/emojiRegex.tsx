import emojiRegexCreator from 'emoji-regex';
const emojiRegex = emojiRegexCreator();
export function isPureEmojiString(text) {
    if (!text || !text.trim()) {
        return false;
    }
    return text.replace(emojiRegex, '').trim() === '';
}
