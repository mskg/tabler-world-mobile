import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, View } from 'react-native';
import { Card, Theme, withTheme } from 'react-native-paper';
import { withNavigation } from 'react-navigation';
import { RoleAvatarGrid } from '../../components/Club/RoleAvatarGrid';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../helper/Logger";
import { CardTitle } from './CardTitle';
import { ClubsSection } from './ClubsSection';
import { GetAreasQuery, GetAreasQueryType, GetAreasQueryType_Area } from './Queries';
import { styles } from './Styles';

const logger = new Logger(Categories.Screens.Structure);

type State = {};

type Props = {
    theme: Theme,
    navigation: any,
    refreshing: boolean,
    fetchPolicy?: any
};

class AreasScreenBase extends React.Component<Props, State> {
    _renderItem = (params) => {
        const item: GetAreasQueryType_Area = params.item;

        return (
            <Card key={item.id} style={styles.card}>
                <CardTitle
                    title={item.name}
                    subtitle={item.association.name}
                    avatar={

                        // there can only be one :)
                        item.area === 9 && item.association.association === "de"
                            ? "DIX"
                            : "D" + item.area
                    }
                />

                <RoleAvatarGrid roles={item.board} items={3} />
                <ClubsSection clubs={item.clubs} />

                <View style={styles.bottom} />
            </Card>
        );
    }

    _key = (item: GetAreasQueryType_Area, index: number) => {
        return item.id;
    }

    render() {
        return (
            <Query<GetAreasQueryType> query={GetAreasQuery} fetchPolicy={this.props.fetchPolicy}>
                {({ loading, error, data, refetch }) => {
                    return (
                        <FlatList
                            contentContainerStyle={styles.container}
                            //@ts-ignore
                            data={
                                _(data != null ? data.Areas : [])
                                    // my own area goes on top
                                    .orderBy((a) => (data != null && data.Me.area.area == a.area) ? 0 : a.area)
                                    .toArray()
                                    .value()
                            }
                            refreshing={loading}
                            onRefresh={refetch}
                            renderItem={this._renderItem}
                            keyExtractor={this._key}
                        />
                    )
                }}
            </Query>
        );
    }
}

export const AreasScreen = withNavigation(withTheme(
    withCacheInvalidation("areas", AreasScreenBase)
));