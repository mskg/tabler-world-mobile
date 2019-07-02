import React from 'react';
import { Query } from 'react-apollo';
import { FlatList, TouchableWithoutFeedback, View } from 'react-native';
import { Button, Card, Theme, Title, withTheme } from 'react-native-paper';
import HTML from 'react-native-render-html';
import { connect } from 'react-redux';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { ScreenWithHeader } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../helper/Logger";
import { I18N } from '../../i18n/translation';
import { AlbumsOverview, AlbumsOverview_Albums } from '../../model/graphql/AlbumsOverview';
import { GetAlbumsOverviewQuery } from '../../queries/GetAlbumsQuery';
import { showAlbum } from '../../redux/actions/navigation';
import { ReadMore } from './readmore';
import { styles } from './Styles';

const logger = new Logger(Categories.Screens.Albums);

type State = {};

type Props = {
    theme: Theme,
    navigation: any,
    fetchPolicy: any,

    showAlbum: typeof showAlbum,
};

class AlbumsScreenBase extends AuditedScreen<Props, State> {

    constructor(props) {
        super(props, AuditScreenName.AlbumList);
    }

    _renderItem = (params) => {
        const item: AlbumsOverview_Albums = params.item;
        const showAlbum = () => this.props.showAlbum(item.id);

        return (
            <Card key={item.id} style={styles.card}>
                <TouchableWithoutFeedback onPress={showAlbum}>
                    <Card.Cover source={{ uri: item.pictures[0].preview_1920 }} style={{
                        borderTopLeftRadius: 8,
                        borderTopRightRadius: 8,
                    }} />
                </TouchableWithoutFeedback>

                <Card.Title
                    title={<Title numberOfLines={2}>{item.name}</Title>}
                    style={styles.title}
                />
                {/*
                <View style={[styles.imageContainer,
                {
                    backgroundColor: this.props.theme.colors.surface,
                    height: 200,
                }]}>
                    <CachedImage
                        theme={this.props.theme}
                        resizeMode="cover"
                        uri={item.pictures[0].preview_1920}
                    />
                </View> */}

                {item.description != null &&
                    <Card.Content>
                        <ReadMore maxHeight={60} renderRevealedFooter={() => null}>
                            <HTML
                                html={item.description}
                                baseFontStyle={{
                                    fontFamily: this.props.theme.fonts.regular,
                                    // fontSize: 12,
                                }}
                                allowFontScaling={false}
                                tagsStyles={
                                    {
                                        p: { paddingBottom: 8, margin: 0 },
                                        b: {
                                            fontFamily: this.props.theme.fonts.medium
                                        },
                                        strong: {
                                            fontFamily: this.props.theme.fonts.medium
                                        },
                                    }
                                }

                            />
                        </ReadMore>
                    </Card.Content>
                }

                {/* <TouchableWithoutFeedback onPress={showAlbum}>
                    <View style={styles.imageContainer}>
                        {
                            item.pictures.map(p =>
                                (<Image
                                    key={p.preview_60}
                                    source={{ uri: p.preview_60 }}
                                    style={styles.imagePreview}
                                />)
                            )
                        }
                    </View>
                </TouchableWithoutFeedback> */}

                <View style={styles.bottom} />

                <Card.Actions style={styles.action}>
                    <Button color={this.props.theme.colors.accent} onPress={showAlbum}>{I18N.Albums.details}</Button>
                </Card.Actions>
            </Card>
        );
    }

    _key = (item: AlbumsOverview_Albums, index: number) => {
        return item.id.toString();
    }

    render() {
        return (
            <ScreenWithHeader header={{ title: I18N.Albums.title }}>
                {/* <Banner
                    visible={true}
                    actions={[

                    ]}
                    image={({ size }) =>
                        <Ionicons name="md-alert" size={size} />
                    }
                >
                    This is an experimental and unsupported feature of the TABLER.WORLD app and may dissapear at any time.
                </Banner> */}

                <Query<AlbumsOverview> query={GetAlbumsOverviewQuery} fetchPolicy={this.props.fetchPolicy}>
                    {({ loading, error, data, refetch }) => {
                        if (error) throw error;

                        return (
                            <FlatList
                                contentContainerStyle={styles.container}
                                //@ts-ignore
                                data={data != null ? data.Albums : []}

                                refreshing={loading}
                                onRefresh={refetch}

                                renderItem={this._renderItem}
                                keyExtractor={this._key}
                            />
                        );
                    }}
                </Query>
            </ScreenWithHeader>
        );
    }
}

export const AlbumsScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation("albums",
            withTheme(
                connect(null, { showAlbum })(AlbumsScreenBase))));