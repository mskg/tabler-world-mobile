import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, View } from 'react-native';
import { Card, Theme, withTheme } from 'react-native-paper';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { RoleAvatarGrid } from '../../components/Club/RoleAvatarGrid';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../helper/Logger";
import { Areas, Areas_Areas } from '../../model/graphql/Areas';
import { GetAreasQuery } from "../../queries/GetAreasQuery";
import { CardTitle } from './CardTitle';
import { ClubsSection } from './ClubsSection';
import { styles } from './Styles';

const logger = new Logger(Categories.Screens.Structure);

type State = {};

type Props = {
    theme: Theme,
    refreshing: boolean,
    fetchPolicy?: any
};

class AreasScreenBase extends AuditedScreen<Props, State> {

    constructor(props) {
        super(props, AuditScreenName.Areas);
    }

    _renderItem = (params) => {
        const item: Areas_Areas = params.item;

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

    _key = (item: Areas_Areas, index: number) => {
        return item.id;
    }

    render() {
        return (
            <Query<Areas> query={GetAreasQuery} fetchPolicy={this.props.fetchPolicy}>
                {({ loading, error, data, refetch }) => {
                    if (error) throw error;

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

export const AreasScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation("areas",
            withTheme(AreasScreenBase)));