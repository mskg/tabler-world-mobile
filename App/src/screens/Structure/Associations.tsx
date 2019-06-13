import _ from 'lodash';
import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, View } from 'react-native';
import { Card, Paragraph, Theme, withTheme } from 'react-native-paper';
import { withNavigation } from 'react-navigation';
import { Accordion } from '../../components/Accordion';
import { RoleAvatarGrid } from '../../components/Club/RoleAvatarGrid';
import { CachedImage } from '../../components/Image/CachedImage';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../helper/Logger";
import { I18N } from '../../i18n/translation';
import { RoleNames } from '../../model/IMember';
import { GetAssociationsQuery, GetAssociationsQueryType, GetAssociationsQueryType_Association } from './Queries';
import { styles } from './Styles';

const logger = new Logger(Categories.Screens.Structure);

type State = {};

type Props = {
    theme: Theme,
    navigation: any,
    fetchPolicy: any,
};

class AssociationsScreenBase extends React.Component<Props, State> {
    _renderItem = (params) => {
        const item: GetAssociationsQueryType_Association = params.item;

        return (
            <Card key={item.association} style={styles.card}>

                <View style={[styles.imageContainer, { backgroundColor: this.props.theme.colors.surface }]}>
                    <CachedImage
                        theme={this.props.theme}
                        style={styles.image}
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

    _key = (item: GetAssociationsQueryType_Association, index: number) => {
        return item.association;
    }

    render() {
        return (
            <Query<GetAssociationsQueryType> query={GetAssociationsQuery} fetchPolicy={this.props.fetchPolicy}>
                {({ loading, error, data, refetch }) => {
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

export const AssociationsScreen = withNavigation(withTheme(
    withCacheInvalidation("associations", AssociationsScreenBase)
));