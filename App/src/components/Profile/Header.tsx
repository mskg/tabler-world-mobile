import React from 'react';
import { Animated, View } from "react-native";
import { Headline, Subheading, Surface, Theme, withTheme } from 'react-native-paper';
import { Header } from '../../components/Header';
import { Circle } from '../../components/Placeholder/Circle';
import { Line } from '../../components/Placeholder/Line';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { Categories, Logger } from '../../helper/Logger';
import { HeaderStyles, HEADER_HEIGHT, HEADER_MARGIN_TOP, TOTAL_HEADER_HEIGHT } from '../../theme/dimensions';
import { IMAGE_SIZE, MEMBER_HEADER_HEIGHT, MEMBER_HEADER_SCROLL_HEIGHT } from './Dimensions';
import { styles } from './Styles';

const logger = new Logger(Categories.UIComponents.Header);

type Props = {
    theme: Theme,

    avatar?: React.ReactElement<{ size, background, containerStyle }>,
    fab?: React.ReactElement<{ top }>,

    title?: string,
    line1?: string,
    line2?: string,

    loading: boolean,

    scrollY: Animated.AnimatedAddition,
    distance: number,
};

const AnimatedSurface = Animated.createAnimatedComponent(Surface);

class ProfileHeaderBase extends React.Component<Props> {
    render() {
        const { scrollY, distance, loading, avatar: Avatar, fab: Fab } = this.props;

        const headerTranslate = scrollY.interpolate({
            inputRange: [0, distance],
            outputRange: [MEMBER_HEADER_HEIGHT, MEMBER_HEADER_HEIGHT - MEMBER_HEADER_SCROLL_HEIGHT],
            extrapolate: 'clamp',
        });

        const imageTranslate = scrollY.interpolate({
            inputRange: [0, distance],
            outputRange: [IMAGE_SIZE * 4, HEADER_HEIGHT - 10],
            extrapolate: 'clamp',
        });

        const paddingTop = scrollY.interpolate({
            inputRange: [0, distance],
            outputRange: [
                TOTAL_HEADER_HEIGHT - IMAGE_SIZE,
                HEADER_MARGIN_TOP + IMAGE_SIZE / 2 - 6
            ],
            extrapolate: 'clamp',
        });

        const titleScale = scrollY.interpolate({
            inputRange: [0, distance],
            outputRange: [1, 0.75],
            extrapolate: 'clamp',
        });

        const titleTranslate = scrollY.interpolate({
            inputRange: [0, distance],
            outputRange: [0, -12],
            extrapolate: 'clamp',
        });

        const subTitleScale = scrollY.interpolate({
            inputRange: [0, distance],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        const subTitleOpacity = scrollY.interpolate({
            inputRange: [0, distance],
            outputRange: [1, 0],
            extrapolate: 'clamp',
        });

        if (__DEV__) { logger.debug("headerTranslate", headerTranslate); }

        const fabTop = scrollY.interpolate({
            inputRange: [0, distance],
            outputRange: [
                280,
                HEADER_HEIGHT + 48,
            ],
            extrapolate: 'clamp',
        });

        return (
            <React.Fragment>
                <AnimatedSurface
                    style={{
                        ...HeaderStyles.header,
                        paddingTop: paddingTop,
                        height: headerTranslate,
                        backgroundColor: this.props.theme.colors.background,
                    }}>

                    <View style={{
                        ...styles.header,
                    }}>
                        <Placeholder
                            ready={!loading}
                            previewComponent={<Circle size={imageTranslate} />}
                        >
                            {!loading && React.cloneElement(Avatar, {
                                size: imageTranslate,
                                background: this.props.theme.colors.backdrop,
                                containerStyle: styles.avatar,
                            })}
                        </Placeholder>

                        <Animated.View
                            style={[
                                styles.header,
                                {
                                    transform: [
                                        { scale: titleScale },
                                        { translateY: titleTranslate },
                                    ],
                                },
                            ]}
                        >
                            <Placeholder
                                ready={!loading}
                                previewComponent={<Line style={styles.titlePlaceholder} width={240} height={24} />}
                            >
                                <Headline
                                    numberOfLines={1}
                                    style={[styles.title, { fontFamily: this.props.theme.fonts.medium }]}
                                >
                                    {this.props.title}
                                </Headline>
                            </Placeholder>
                        </Animated.View>

                        <Animated.View
                            style={[
                                styles.header,
                                {
                                    opacity: subTitleOpacity
                                },
                                {
                                    transform: [
                                        { scale: subTitleScale },
                                    ],
                                },
                            ]}
                        >
                            <Placeholder
                                ready={!loading}
                                previewComponent={
                                    <View style={{ alignItems: "center" }}>
                                        <Line style={styles.subTitlePlaceholder} width={160} height={16} />
                                        <Line style={styles.subTitlePlaceholder} width={200} height={16} />
                                    </View>
                                }
                            >
                                <>
                                    <Subheading
                                        style={{ ...styles.subTitle, color: this.props.theme.colors.disabled }}
                                        numberOfLines={1}
                                    >
                                        {this.props.line1}
                                    </Subheading>
                                    <Subheading
                                        style={{ ...styles.subTitle, color: this.props.theme.colors.disabled }}
                                        numberOfLines={1
                                        }
                                    >
                                        {this.props.line2}
                                    </Subheading>
                                </>
                            </Placeholder>

                        </Animated.View>
                    </View>
                </AnimatedSurface>

                {Fab && React.cloneElement(Fab, { top: fabTop })}

                <Header
                    style={HeaderStyles.topBar}
                    showAppBar={true}
                    showLine={false}
                    backgroundColor="transparent"
                    showBack={true}
                    title="" />
            </React.Fragment>
        );
    }
}

export const ProfileHeader = withTheme(ProfileHeaderBase);