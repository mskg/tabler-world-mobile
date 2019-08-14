import React from 'react';
import { StyleSheet } from "react-native";
import Markdown, { getUniqueID, styles } from 'react-native-markdown-renderer';
import { Subheading, Theme, Title, withTheme } from "react-native-paper";

type Props = {
    text: string,
    theme: Theme,
};

class DocViewer extends React.PureComponent<Props> {
    constructor(props) {
        super(props)
        this.state = {
            text: "",
        }
    }

    styles = StyleSheet.create({
        text: {
            fontFamily: this.props.theme.fonts.regular,
            color: this.props.theme.colors.text,
        },

        listUnorderedItemIcon: {
            ...styles.listUnorderedItemIcon,
            color: this.props.theme.colors.text,
        },

        listOrderedItemIcon: {
            ...styles.listOrderedItemIcon,
            color: this.props.theme.colors.text,
        },

        strong: {
            fontFamily: this.props.theme.fonts.medium
        }
    });

    rules = {
        heading1: (_node, children, _parent, _styles) =>
            <Title key={getUniqueID()}>{children}</Title>,

        heading2: (_node, children, _parent, _styles) =>
            <Subheading key={getUniqueID()}>{children}</Subheading>,
    };

    render() {
        return (
            <Markdown style={this.styles} rules={this.rules}>{this.props.text}</Markdown>
        );
    }
}

export default withTheme(DocViewer);