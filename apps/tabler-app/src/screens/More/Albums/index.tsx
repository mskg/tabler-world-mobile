import React from 'react';
import { Query } from 'react-apollo';
import { Dimensions, FlatList, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Card, Theme, Title, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { HTMLView } from '../../../components/HTMLView';
import { CannotLoadWhileOffline } from '../../../components/NoResults';
import { Placeholder } from '../../../components/Placeholder/Placeholder';
import { ReadMore } from '../../../components/ReadMore';
import { TapOnNavigationParams } from '../../../components/ReloadNavigationOptions';
import { ScreenWithHeader } from '../../../components/Screen';
import { withCacheInvalidation } from '../../../helper/cache/withCacheInvalidation';
import { I18N } from '../../../i18n/translation';
import { AlbumsOverview, AlbumsOverview_Albums } from '../../../model/graphql/AlbumsOverview';
import { GetAlbumsOverviewQuery } from '../../../queries/Album/GetAlbumsQuery';
import { showAlbum } from '../../../redux/actions/navigation';
import { CardPlaceholder } from './CardPlaceholder';
import { styles } from './Styles';

// const logger = new Logger(Categories.Screens.Albums);

type State = {};

type Props = {
    theme: Theme,
    navigation: any,
    fetchPolicy: any,

    showAlbum: typeof showAlbum,
};

class AlbumsScreenBase extends AuditedScreen<Props & NavigationInjectedProps<TapOnNavigationParams>, State> {
    flatList!: FlatList<AlbumsOverview_Albums> | null;

    constructor(props) {
        super(props, AuditScreenName.AlbumList);
    }

    componentDidMount() {
        super.componentDidMount();
        
        this.props.navigation.setParams({
            tapOnTabNavigator: () => {
                requestAnimationFrame(
                    () => this.flatList?.scrollToOffset({
                        offset: 0, animated: true,
                    }),
                );

                // setTimeout(
                //     () => this.props.refresh(),
                //     100
                // );
            },
        });
    }

    _renderItem = (params) => {
        const item: AlbumsOverview_Albums = params.item;
        const showAlbumFunc = () => this.props.showAlbum(item.id);

        return (
            <Card key={item.id} style={styles.card}>
                <TouchableWithoutFeedback onPress={showAlbumFunc}>
                    <Card.Cover
                        source={{ uri: item.pictures[0].preview_1920 }}
                        style={{
                            borderTopLeftRadius: 8,
                            borderTopRightRadius: 8,
                        }}
                    />
                </TouchableWithoutFeedback>

                <Card.Title
                    title={<Title numberOfLines={2}>{item.name}</Title>}
                    style={styles.title}
                />

                {item.description != null &&
                    <Card.Content>
                        <ReadMore maxHeight={60} renderRevealedFooter={() => null}>
                            <HTMLView
                                maxWidth={Dimensions.get('window').width - 32 * 2}
                                html={item.description}
                            />
                        </ReadMore>
                    </Card.Content>
                }

                <View style={styles.bottom} />

                <Card.Actions style={styles.action}>
                    <Button color={this.props.theme.colors.accent} onPress={showAlbumFunc}>{I18N.Albums.details}</Button>
                </Card.Actions>
            </Card>
        );
    }

    _key = (item: AlbumsOverview_Albums, _index: number) => {
        return item.id.toString();
    }

    render() {
        return (
            <ScreenWithHeader header={{ showBack: true, title: I18N.Albums.title }}>
                <Query<AlbumsOverview> query={GetAlbumsOverviewQuery} fetchPolicy={this.props.fetchPolicy}>
                    {({ loading, error, data, refetch }) => {
                        if (error) throw error;

                        if (!loading && (data == null || data.Albums == null)) {
                            return <CannotLoadWhileOffline />;
                        }

                        return (
                            <Placeholder
                                ready={data != null && data.Albums != null}
                                previewComponent={<CardPlaceholder />}
                            >
                                <FlatList
                                    ref={(r) => this.flatList = r}

                                    contentContainerStyle={styles.container}
                                    data={data != null ? data.Albums : []}

                                    refreshing={loading}
                                    onRefresh={refetch}

                                    renderItem={this._renderItem}
                                    keyExtractor={this._key}
                                />
                            </Placeholder>
                        );
                    }}
                </Query>
            </ScreenWithHeader>
        );
    }
}

// tslint:disable-next-line: export-name
export const AlbumsScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'albums',
            withTheme(
                connect(null, { showAlbum })(AlbumsScreenBase))));
