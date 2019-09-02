import { findAll } from 'highlight-words-core';
import React from 'react';
import { Text } from 'react-native-paper';

type Props = {
    autoEscape,
    highlightStyle,
    searchWords,
    textToHighlight,
    sanitize,
    style?: any,
};

export class Highlighter extends React.Component<Props> {
    render() {
      const {
        autoEscape,
        highlightStyle,
        searchWords,
        textToHighlight,
        sanitize,
        style,
    } = this.props;

      const chunks = findAll({
        textToHighlight,
        searchWords,
        sanitize,
        autoEscape,
    });

      return (
      <Text style={style}>
        {chunks.map((chunk, index) => {
            const text = textToHighlight.substr(chunk.start, chunk.end - chunk.start);

            return !chunk.highlight
            ? (text)
            : (<Text key={index} style={chunk.highlight && highlightStyle}>{text}</Text>);
        })}
      </Text>
    );
  }
}
