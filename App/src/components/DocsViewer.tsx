import React from 'react';
import Markdown, { getUniqueID } from 'react-native-markdown-renderer';
import { Subheading, Text, Title } from "react-native-paper";

type Props = {
   text: string,
};

const rules = {
    heading1: (_node, children, _parent, _styles) =>
        <Title key={getUniqueID()}>
            {children}
        </Title>,

    heading2: (_node, children, _parent, _styles) =>
        <Subheading key={getUniqueID()}>
            {children}
        </Subheading>,

    text: (node, _children, _parent, _styles) =>
        <Text key={node.key}>
            {node.content}
        </Text>,
};

export default class DocViewer extends React.PureComponent<Props> {
    constructor(props) {
        super(props)
        this.state = {
            text: "",
        }
    }

    render() {
        return (
            <Markdown rules={rules}>{this.props.text}</Markdown>
        );
    }
}