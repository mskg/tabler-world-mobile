import color from 'color';
import React from 'react';
import { View } from 'react-native';
import { Appbar, Theme, withTheme } from 'react-native-paper';
import { MaterialTopTabBar } from 'react-navigation-tabs';
import { connect } from 'react-redux';
import { StandardHeader } from '../../../components/Header';
import { I18N } from '../../../i18n/translation';
import { showNearbySettings } from '../../../redux/actions/navigation';
import { TOTAL_HEADER_HEIGHT } from '../../../theme/dimensions';
import { NearbyEnabled } from './NearbyEnabled';
import { NearbyOptIn } from './NearbyOptIn';

type Props = {
    theme: Theme,
    showNearbySettings: typeof showNearbySettings;
};

class NearbyScreenBase extends React.Component<Props> {
    render() {
        const titleColor = color(this.props.theme.colors.text)
            .alpha(0.87)
            .rgb()
            .string();

        return (
            <>
                <View
                    style={{
                        paddingTop: TOTAL_HEADER_HEIGHT,
                        backgroundColor: this.props.theme.colors.background,
                    }}
                >
                    <NearbyEnabled>
                        {/* @ts-ignore style is missing in .d.ts */}
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

                            {...this.props}
                        />
                    </NearbyEnabled>

                    <StandardHeader
                        showLine={false}
                        showAppBar={true}
                        showBack={true}

                        content={([
                            <Appbar.Content key="cnt" titleStyle={{ fontFamily: this.props.theme.fonts.medium }} title={I18N.NearbyMembers.title} />,
                            // <Appbar.Action key="filter" icon="filter-list" onPress={() => {}} />,
                            <Appbar.Action key="settings" icon="settings" onPress={() => this.props.showNearbySettings()} />,
                        ])}
                    />
                </View>

                <NearbyOptIn />
            </>
        );
    }
}

export const NearbyTabBar = connect(
    null, { showNearbySettings },
)(withTheme(NearbyScreenBase));
