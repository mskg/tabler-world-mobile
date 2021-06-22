import React from 'react';
import { FlatList, Platform, View } from 'react-native';
import { Caption, Theme, TouchableRipple, withTheme } from 'react-native-paper';
import { NavigationInjectedProps, withNavigation } from 'react-navigation';
import { FamilyBadge } from '../../components/FamilyBadge';
import { FlagAvatar as FlagAvatarBase } from '../../components/FlagAvatar';
import { renderDivider } from '../../components/ListRenderer';
import { EmptyComponent } from '../../components/NoResults';
import { I18N } from '../../i18n/translation';
import { SearchDirectory_SearchDirectory_nodes } from '../../model/graphql/SearchDirectory';
import { IWhoAmI } from '../../model/IWhoAmI';
import { CardTitle } from '../Structure/CardTitle';

type OwnProps = {
    theme: Theme,

    section?: string,
    me?: IWhoAmI,

    data: SearchDirectory_SearchDirectory_nodes[],
    extraData?: any,

    refreshing?: boolean,
    onRefresh?: () => void,

    renderItem?: (member: SearchDirectory_SearchDirectory_nodes, onPress: any) => React.ReactElement | null,
    onItemSelected?: (member: SearchDirectory_SearchDirectory_nodes) => void,

    onEndReached?: () => any;
};

type DispatchPros = {
};

type Props = OwnProps & DispatchPros & NavigationInjectedProps;

const FlagAvatar = ({ flag, name }) => {
    return (
        <FlagAvatarBase
            source={flag}
            size={38}
            label={name.toUpperCase()}
        />
    );
};

const Embedded = ({ theme, name, family, familyName, ...props }) => {
    return (
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <FamilyBadge theme={theme} family={family} familyName={familyName} />

            <Caption {...props}>
                {name}
            </Caption>
        </View>
    );
};


export class StructureSearchListBase extends React.Component<Props> {
    _flatList!: FlatList<SearchDirectory_SearchDirectory_nodes> | null;

    constructor(props: Props) {
        super(props);
    }

    _onPress = (item: SearchDirectory_SearchDirectory_nodes) => {
        if (this.props.onItemSelected != null) {
            requestAnimationFrame(
                // @ts-ignore
                () => this.props.onItemSelected(item));
        }
    }

    // tslint:disable-next-line: max-func-body-length
    _renderItem = ({ item }: { item: SearchDirectory_SearchDirectory_nodes }): React.ReactElement | null => {
        if (item.__typename === 'Club') {
            return (
                <>
                    <View
                        style={{
                            backgroundColor: this.props.theme.colors.surface,
                            // width: ITEM_WIDTH
                        }}
                    >
                        <TouchableRipple
                            onPress={() => this._onPress(item)}
                            style={{
                                margin: 0,
                                padding: 0,
                            }}
                        >
                            <CardTitle
                                title={item.name}
                                subtitle={
                                    <Embedded
                                        name={`${item.area.name}, ${item.association.name}`}
                                        family={item.family.id}
                                        familyName={item.family.shortname}
                                        theme={this.props.theme}
                                    />
                                }
                                avatar={<FlagAvatar name={item.association.id} flag={item.association.flag} />}
                            />
                        </TouchableRipple>
                    </View>
                    {renderDivider(this.props.theme)}
                </>
            );
        }

        if (item.__typename === 'Area') {
            return (
                <>
                    <View
                        style={{
                            backgroundColor: this.props.theme.colors.surface,
                            // width: ITEM_WIDTH
                        }}
                    >
                        <TouchableRipple
                            onPress={() => this._onPress(item)}
                            style={{
                                margin: 0,
                                padding: 0,
                            }}
                        >
                            <CardTitle
                                title={item.name}
                                subtitle={`${item.shortname}, ${item.association.name}`}
                                avatar={<FlagAvatar name={item.association.id} flag={item.association.flag} />}
                            />
                        </TouchableRipple>
                    </View>
                    {renderDivider(this.props.theme)}
                </>
            );
        }

        if (item.__typename === 'Association') {
            return (
                <>
                    <View
                        style={{
                            backgroundColor: this.props.theme.colors.surface,
                            // width: ITEM_WIDTH
                        }}
                    >
                        <TouchableRipple
                            onPress={() => this._onPress(item)}
                            style={{
                                margin: 0,
                                padding: 0,
                            }}
                        >
                            <CardTitle
                                title={item.name}
                                avatar={<FlagAvatar name={item.id} flag={item.flag} />}
                            />
                        </TouchableRipple>
                    </View>
                    {renderDivider(this.props.theme)}
                </>
            );
        }

        return null;
    }

    _extractKey = (item: SearchDirectory_SearchDirectory_nodes) => `${item.__typename}::${item.id}`;
    _renderDivider = () => renderDivider(this.props.theme);

    render() {
        return (
            <FlatList
                ref={(fl) => this._flatList = fl}
                extraData={this.props.extraData}

                scrollEventThrottle={16}
                ItemSeparatorComponent={this._renderDivider}

                removeClippedSubviews={Platform.OS !== 'ios'}

                renderItem={this._renderItem}

                ListEmptyComponent={this.props.refreshing ? undefined : <EmptyComponent title={I18N.Screen_Members.noresults} />}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 56 + 10 }}

                keyExtractor={this._extractKey}

                data={this.props.data}

                refreshing={this.props.refreshing}
                onRefresh={this.props.onRefresh}

                onEndReached={this.props.onEndReached}
                onEndReachedThreshold={0.5}
            />
        );
    }
}

export const StructureSearchList = withNavigation(withTheme(StructureSearchListBase));
