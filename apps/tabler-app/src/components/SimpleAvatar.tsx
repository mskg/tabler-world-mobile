import React from 'react';
import { TextImageAvatar } from './TextImageAvatar';

type Props = {
    text: string | null,
    pic: string | null,
    size?: number;
};

export class SimpleAvatar extends React.PureComponent<Props> {
    render() {
        const { text, pic, size } = this.props;

        let letters = '';
        if (text) {
            const words = text.split(' ');
            if (words.length >= 2) {
                letters = words[0].substr(0, 1).toUpperCase()
                    + words[1].substr(0, 1).toUpperCase();
            } else {
                letters = text.substr(0, 2).toUpperCase();
            }
        }

        return (
            <TextImageAvatar
                source={pic}
                size={size != null ? size : 38}
                label={letters}
            />
        );
    }
}
