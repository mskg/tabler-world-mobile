import { MaterialIcons } from '@expo/vector-icons';
import color from 'color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Theme, TouchableRipple, withTheme } from 'react-native-paper';

type Props = {
    title: React.ReactNode,
    description?: React.ReactNode,
    left?: (props: { color: string }) => React.ReactNode,
    expanded?: boolean,

    onPress?: () => any,
    children: React.ReactNode,
    theme: Theme,
    style?: any,
};

type State = {
    expanded: boolean,
};

class AccordionBase extends React.Component<Props, State> {
    state = {
        expanded: this.props.expanded || false,
    };

    _handlePress = () => {
        this.props.onPress && this.props.onPress();

        // if (this.props.expanded === undefined) {
            // Only update state of the `expanded` prop was not passed
            // If it was passed, the component will act as a controlled component
        this.setState(state => ({
                expanded: !state.expanded,
            }));
        // }
    }

    render() {
        const { left, title, description, children, theme, style } = this.props;
        const titleColor = color(theme.colors.text)
            .alpha(0.87)
            .rgb()
            .string();
        const descriptionColor = color(theme.colors.text)
            .alpha(0.54)
            .rgb()
            .string();

        const expanded = this.state.expanded;

        return (
            <View>
                <TouchableRipple
                    style={[styles.container, style, { backgroundColor: this.props.theme.colors.surface }]}
                    onPress={this._handlePress}
                    accessibilityTraits="button"
                    accessibilityComponentType="button"
                    accessibilityRole="button"
                >
                    <View
                        style={[styles.row]}
                        pointerEvents="none"
                    >
                        {left
                            ? left({
                                color: expanded ? theme.colors.primary : descriptionColor,
                            })
                            : null}
                        <View style={[styles.item, styles.content]}>
                            <Text
                                numberOfLines={1}
                                style={[
                                    styles.title,
                                    {
                                        color: titleColor,
                                    },
                                ]}
                            >
                                {title}
                            </Text>
                            {description && (
                                <Text
                                    numberOfLines={2}
                                    style={[
                                        styles.description,
                                        {
                                            color: descriptionColor,
                                        },
                                    ]}
                                >
                                    {description}
                                </Text>
                            )}
                        </View>
                        <View style={[styles.item, description ? styles.multiline : null]}>
                            <MaterialIcons
                                name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                                color={titleColor}
                                size={24}
                            />
                        </View>
                    </View>
                </TouchableRipple>
                {expanded &&
                    <View style={{ /*paddingBottom: 16,*/ backgroundColor: this.props.theme.colors.surface }}>
                        {
                            // @ts-ignore
                            React.Children.map(children, (child) => {
                                if (
                                    left &&
                                    React.isValidElement(child) &&
                                    // @ts-ignore
                                    !child.props.left && !child.props.right
                                ) {
                                    return React.cloneElement(child, {
                                        // @ts-ignore
                                        style: [styles.child, child.props.style],
                                    });
                                }

                                return child;
                            })
                        }
                    </View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    multiline: {
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        // fontSize: 16,
    },
    description: {
        fontSize: 14,
    },
    item: {
        margin: 8,
    },
    child: {
        paddingLeft: 64,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
    },
});

export const Accordion = withTheme(AccordionBase);
