
import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { Caption, Text, Theme, Title, withTheme } from 'react-native-paper';

type Props = {
    title: React.ReactNode,
    titleStyle?: any,
    subtitle?: React.ReactNode,
    subtitleStyle?: any,

    left?: (props: { size: number }) => React.ReactNode,
    leftStyle?: any,

    right?: (props: { size: number }) => React.ReactNode,
    rightStyle?: any,

    index?: number,

    total?: number,
    style?: any,

    theme: Theme,
};

const LEFT_SIZE = 40;

/**
 * 1:1 copy of the paper classes
 * Contains workarround for Android:
 *
 * <Caption>...,
 * <Title>...
 *
 * does not allow resetting the font to regular?
 */
class CardTitleBase extends React.Component<Props> {
    static displayName = 'Card.Title';

    render() {
        const {
            left,
            leftStyle,
            right,
            rightStyle,
            subtitle,
            subtitleStyle,
            style,
            title,
            titleStyle,
        } = this.props;

        return (
            <View
                style={[
                    styles.container,
                    { height: subtitle || left || right ? 72 : 50 },
                    style,
                ]}
            >
                {left ? (
                    <View style={[styles.left, leftStyle]}>
                        {left({
                            size: LEFT_SIZE,
                        })}
                    </View>
                ) : null}

                <View style={[styles.titles]}>
                    {typeof (title) == 'string' ? (
                        <Title
                            style={[
                                styles.title,
                                { marginBottom: subtitle ? 0 : 2 },
                                titleStyle,
                            ]}
                            numberOfLines={1}
                        >
                            {title}
                        </Title>
                    ) : (
                            <Text
                                style={[
                                    styles.title,
                                    { marginBottom: subtitle ? 0 : 2 },
                                    titleStyle,
                                ]}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                        )}

                    {typeof (subtitle) === 'string'
                        ? (
                            <Caption style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
                                {subtitle}
                            </Caption>
                        )
                        : React.cloneElement(subtitle, {
                            style: [styles.subtitle, subtitleStyle],
                        })
                    }
                </View>

                <View style={rightStyle}>{right ? right({ size: 24 }) : null}</View>
            </View>
        );
    }
}

/* <Text
                        style={[styles.subtitle, subtitleStyle]}
                        numberOfLines={1}
                        >
                            {subtitle}
                        </Text>
                    } */

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 16,
    },

    left: {
        justifyContent: 'center',
        marginRight: 16,
        height: LEFT_SIZE,
        width: LEFT_SIZE,
    },

    titles: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        height: 50,
    },

    title: {
        minHeight: 30,
    },

    subtitle: {
        minHeight: 20,
        marginVertical: 0,
    },
});

export const CardTitle = withTheme(CardTitleBase);
