import color from 'color';
import React from 'react';
import { View } from 'react-native';
import { Theme, withTheme } from 'react-native-paper';
import { MaterialTopTabBar } from 'react-navigation';
import { StandardHeader } from '../../components/Header';
import { I18N } from '../../i18n/translation';
import { TOTAL_HEADER_HEIGHT } from '../../theme/dimensions';

type Props = {
    theme: Theme,
    title: string,
}

class ScreenWithBarBase extends React.Component<Props> {
    render() {
        const titleColor = color(this.props.theme.colors.text)
            .alpha(0.87)
            .rgb()
            .string();

        return (
            <View style={{
                paddingTop: TOTAL_HEADER_HEIGHT,
                backgroundColor: this.props.theme.colors.background,
            }}>
                <MaterialTopTabBar
                    allowFontScaling={false}
                    showIcon={false}

                    activeTintColor={this.props.theme.colors.accent}
                    inactiveTintColor={titleColor}

                    indicatorStyle={{
                        backgroundColor: this.props.theme.colors.accent,
                    }}

                    labelStyle={{
                        fontFamily: this.props.theme.fonts.medium,
                    }}


                    style={
                        {
                            backgroundColor: this.props.theme.colors.primary,
                        }
                    }
                    {...this.props} />

                <StandardHeader showLine={false} showAppBar={true} title={I18N.Structure.title}

                    // content={(
                    //     <View style={[styles.top]}>
                    //         <View style={styles.search}>
                    //             <Searchbar
                    //                 style={[styles.searchbar]}
                    //                 selectionColor={this.props.theme.colors.accent}
                    //                 placeholder={I18N.Search.search}
                    //                 autoCorrect={false}

                    //                 value={""}
                    //                 onChangeText={text => { }}
                    //             />
                    //         </View>
                    //     </View>
                    // )}
                />
            </View>
        );
    }
}

export const StructureScreen = withTheme(ScreenWithBarBase);
