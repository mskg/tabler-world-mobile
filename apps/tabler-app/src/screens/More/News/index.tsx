import React from 'react';
import { Query } from 'react-apollo';
import { Dimensions, FlatList, View } from 'react-native';
import { Button, Card, Text, Theme, withTheme } from 'react-native-paper';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../../analytics/AuditedScreen';
import { AuditScreenName } from '../../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../../components/ErrorBoundary';
import { HTMLView } from '../../../components/HTMLView';
import { MemberAvatar } from '../../../components/MemberAvatar';
import { CannotLoadWhileOffline } from '../../../components/NoResults';
import { Placeholder } from '../../../components/Placeholder/Placeholder';
import { ScreenWithHeader } from '../../../components/Screen';
import { withCacheInvalidation } from '../../../helper/cache/withCacheInvalidation';
import { I18N } from '../../../i18n/translation';
import { TopNews, TopNews_TopNews } from '../../../model/graphql/TopNews';
import { GetNewsQuery } from '../../../queries/News/GetNewsQuery';
import { showAlbum, showNewsArticle } from '../../../redux/actions/navigation';
import { CardPlaceholder } from './CardPlaceholder';
import { styles } from './Styles';

// const logger = new Logger(Categories.Screens.News);

type State = {};

type Props = {
    theme: Theme,
    navigation: any,
    fetchPolicy: any,

    showAlbum: typeof showAlbum,
    showNewsArticle: typeof showNewsArticle,
};

class NewsScreenBase extends AuditedScreen<Props, State> {
    flatList!: FlatList<TopNews_TopNews> | null;

    constructor(props) {
        super(props, AuditScreenName.TopNews);
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
        const item: TopNews_TopNews = params.item;
        const _showAlbum = () => item.album && this.props.showAlbum(item.album.id);
        const showArticle = () => { this.props.showNewsArticle(item.id); return null; };

        return (
            <Card key={item.id} style={styles.card}>
                <Card.Title
                    title={item.name}
                    subtitle={item.createdby.firstname + ' ' + item.createdby.lastname}
                    left={({ size }) => <MemberAvatar size={size} member={item.createdby} />}
                    style={styles.title}
                />

                {item.description != null && (
                    <Card.Content>
                        <View
                            style={{ maxHeight: 200, overflow: 'hidden' }}
                        >
                            <HTMLView
                                maxWidth={Dimensions.get('window').width - 32 * 2}
                                html={item.description}
                                skipIFrames={true}
                            />
                        </View>

                        <Text style={styles.button} onPress={showArticle}>
                            {I18N.Component_ReadMore.more}
                        </Text>
                    </Card.Content>
                )}

                <View style={styles.bottom} />

                {false && item.album && (
                    <Card.Actions style={styles.action}>
                        <Button color={this.props.theme.colors.accent} onPress={_showAlbum}>{I18N.Screen_Albums.details}</Button>
                    </Card.Actions>
                )}
            </Card>
        );
    }

    _key = (item: TopNews_TopNews, _index: number) => {
        return item.id.toString();
    }

    render() {
        return (
            <ScreenWithHeader header={{ showBack: true, title: I18N.Screen_News.title }}>
                <Query<TopNews> query={GetNewsQuery} fetchPolicy={this.props.fetchPolicy}>
                    {({ loading, error, data, refetch }) => {
                        if (error) throw error;

                        if (!loading && (data == null || data.TopNews == null)) {
                            return <CannotLoadWhileOffline />;
                        }

                        return (
                            <Placeholder
                                ready={data != null && data.TopNews != null}
                                previewComponent={<CardPlaceholder />}
                            >
                                <FlatList
                                    ref={(r) => this.flatList = r}

                                    contentContainerStyle={styles.container}
                                    data={data != null ? data.TopNews : []}

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
export const NewsScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'news',
            withTheme(
                connect(null, { showAlbum, showNewsArticle })(NewsScreenBase))));
