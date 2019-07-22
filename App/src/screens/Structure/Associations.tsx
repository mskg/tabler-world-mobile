import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, View } from 'react-native';
import { Card, Paragraph, Theme, withTheme } from 'react-native-paper';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { Accordion } from '../../components/Accordion';
import { RoleAvatarGrid } from '../../components/Club/RoleAvatarGrid';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { CachedImage } from '../../components/Image/CachedImage';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../helper/Logger";
import { I18N } from '../../i18n/translation';
import { Associations, Associations_Associations } from '../../model/graphql/Associations';
import { RoleNames } from '../../model/IRole';
import { GetAssociationsQuery } from "../../queries/GetAssociationsQuery";
import { styles } from './Styles';

const logger = new Logger(Categories.Screens.Structure);

type State = {};

type Props = {
    theme: Theme,
    navigation: any,
    fetchPolicy: any,
};

class AssociationsScreenBase extends AuditedScreen<Props, State> {

    constructor(props) {
        super(props, AuditScreenName.Associations);
    }

    _renderItem = (params) => {
        const item: Associations_Associations = params.item;

        return (
            <Card key={item.association} style={styles.card}>

                <View style={[styles.imageContainer, { backgroundColor: this.props.theme.colors.surface }]}>
                    <CachedImage
                        theme={this.props.theme}
                        style={styles.image}
                        cacheGroup="club"
                        uri="https://www.round-table.de/theme/public/assets/frontend/img/logo.png"
                    />
                </View>

                <Card.Title
                    title={item.name}
                />

                <Card.Content>
                    <Paragraph>
                        {`LEBENSFREUNDE

Tabler sind Freunde des Lebens. Sie leben gern und sind sich bewusst, dass es vielen nicht so gut geht. Sie möchten ihre Lebensfreude teilen mit jenen, die nicht so viel Glück hatten oder haben.

Tabler sind Freunde fürs Leben. Sie haben Freunde auf der ganzen Welt, völlig unabhängig davon, ob sie sich vorher schon einmal begegnet sind, oder noch nicht.

#weilwirdasmachen
#lebensfreunde
#tableraufreisen`}
                    </Paragraph>
                </Card.Content>

                {item.board.length > 0 &&
                    <Accordion style={styles.accordeon} title={I18N.Structure.president} expanded={true}>
                        <RoleAvatarGrid roles={item.board.filter(r => r.role == RoleNames.President)} items={1} />
                    </Accordion>
                }

                {item.board.length > 0 &&
                    <Accordion style={styles.accordeon} title={I18N.Structure.board} expanded={false}>
                        <RoleAvatarGrid roles={item.board.filter(r => r.role !== RoleNames.President)} items={2} />
                    </Accordion>
                }

                {item.boardassistants.length > 0 &&
                    <Accordion style={styles.accordeon} title={I18N.Structure.assist} expanded={false}>
                        <RoleAvatarGrid roles={item.boardassistants} items={2} />
                    </Accordion>
                }

                <View style={styles.bottom} />
            </Card>
        );
    }

    _key = (item: Associations_Associations, index: number) => {
        return item.association;
    }

    render() {
        return (
            <Query<Associations> query={GetAssociationsQuery} fetchPolicy={this.props.fetchPolicy}>
                {({ loading, error, data, refetch }) => {
                    if (error) throw error;

                    return (
                        <FlatList
                            contentContainerStyle={styles.container}
                            //@ts-ignore
                            data={
                                _(data != null ? data.Associations : [])
                                    .orderBy(a => (data != null && data.Me.association.association == a.association)
                                        ? "aa"
                                        : a.association)
                                    .toArray()
                                    .value()
                            }

                            refreshing={loading}
                            onRefresh={refetch}

                            renderItem={this._renderItem}
                            keyExtractor={this._key}
                        />
                    );
                }}
            </Query>
        );
    }
}

export const AssociationsScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation("associations",
            withTheme(AssociationsScreenBase)));