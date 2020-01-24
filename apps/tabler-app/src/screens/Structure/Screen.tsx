import color from 'color';
import React from 'react';
import { View } from 'react-native';
import { Appbar, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { MaterialTopTabBar } from 'react-navigation-tabs';
import { connect } from 'react-redux';
import { StandardHeader } from '../../components/Header';
import { I18N } from '../../i18n/translation';
import { showAssociation, showStructureSearch } from '../../redux/actions/navigation';
import { TOTAL_HEADER_HEIGHT } from '../../theme/dimensions';
import { StructureParams } from './StructureParams';

type Props = {
    theme: Theme,
    showAssociation: typeof showAssociation;
    showStructureSearch: typeof showStructureSearch;
};

type State = {
    title: string,
};

class ScreenWithBarBase extends React.Component<Props & NavigationInjectedProps<StructureParams>, State> {
    state: State = {
        title: I18N.Structure.title,
    };

    render() {
        const titleColor = color(this.props.theme.colors.text)
            .alpha(0.87)
            .rgb()
            .string();

        return (
            <View
                style={{
                    paddingTop: TOTAL_HEADER_HEIGHT,
                    backgroundColor: this.props.theme.colors.background,
                }}
            >
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

                <StandardHeader
                    showLine={false}
                    showAppBar={true}

                    showBack={this.props.navigation.getParam('association') != null}

                    content={([
                        (
                            <Appbar.Content
                                key="cnt"
                                titleStyle={{ fontFamily: this.props.theme.fonts.medium }}
                                title={
                                    this.props.navigation.getParam('associationName')
                                        ? this.props.navigation.getParam('associationName')
                                        : this.props.navigation.getParam('association')
                                            ? I18N.Structure.title
                                            : I18N.Structure.mytitle
                                }
                            />
                        ),
                        this.props.navigation.getParam('association') == null
                            ? (
                                <Appbar.Action
                                    key="search"
                                    icon="search"
                                    onPress={() => this.props.showStructureSearch()}
                                />
                            ) : null,
                    ].filter(Boolean))}
                />
            </View>
        );
    }
}

// tslint:disable-next-line: export-name
export const StructureScreen = connect(null, { showAssociation, showStructureSearch })(withTheme(ScreenWithBarBase));
