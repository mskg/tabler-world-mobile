import * as ScreenOrientation from 'expo-screen-orientation';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Query } from 'react-apollo';
import { Dimensions, FlatList, Platform, Share as ShareNative, StatusBar, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Gallery from 'react-native-image-gallery';
import { IconButton, Portal, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { CachedImage } from '../../components/Image/CachedImage';
import { Placeholder } from '../../components/Placeholder/Placeholder';
import { Square } from '../../components/Placeholder/Square';
import { ScreenWithHeader } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { I18N } from '../../i18n/translation';
import { Album, AlbumVariables, Album_Album_pictures } from '../../model/graphql/Album';
import { GetAlbumQuery } from '../../queries/Album/GetAlbumQuery';
import { IAlbumParams } from '../../redux/actions/navigation';
import { HEADER_MARGIN_TOP } from '../../theme/dimensions';
import { logger } from './logger';
import ProgressiveImage from './ProgressiveImage';
import { styles } from './Styles';
import { QueryFailedError } from '../../helper/QueryFailedError';

type State = {
    viewGallery: boolean,
    selectedIndex: number,
    hideButtons: boolean,
};

type Props = {
    theme: Theme,
    navigation: any,
    fetchPolicy: any,
};

class AlbumScreenBase extends AuditedScreen<Props & NavigationInjectedProps<IAlbumParams>, State> {
    data: Album | undefined;

    constructor(props) {
        super(props, AuditScreenName.Album);

        this.state = {
            viewGallery: false,
            selectedIndex: 0,
            hideButtons: false,
        };
    }

    componentDidMount() {
        const { album } = this.props.navigation.state.params as IAlbumParams;

        this.audit.submit({
            [AuditPropertyNames.Album]: album.toString(),
        });
    }

    _renderItem = (params) => {
        const item = params.item;

        return (
            <TouchableWithoutFeedback onPress={() => this.setState({ viewGallery: true, hideButtons: false, selectedIndex: params.index }, () => ScreenOrientation.unlockAsync())}>
                <View style={styles.imageContainer}>

                    <View style={styles.imageThumbnail}>
                        <CachedImage
                            resizeMode="cover"
                            cacheGroup="album"
                            preview={
                                // android doesn't like the animation here?
                                Platform.OS === 'android' ? undefined :
                                    <Placeholder
                                        ready={false}
                                        previewComponent={
                                            <Square width={Dimensions.get('window').width / 4 - 3} />
                                        }
                                    />
                            }
                            uri={item.source.preview}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    _key = (_item: Album_Album_pictures, index: number) => {
        return index.toString();
    }

    _toggleButtons = () => requestAnimationFrame(() => this.setState(
        { hideButtons: !this.state.hideButtons }))

    _hideGallery = () => requestAnimationFrame(() => this.setState(
        { viewGallery: false },
        () => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)))

    _export = () => requestAnimationFrame(() => {
        if (!this.data || !this.data.Album) return;

        const source = this.data.Album.pictures[this.state.selectedIndex].preview_1920;

        FileSystem.downloadAsync(
            source,
            `${FileSystem.cacheDirectory}share.jpeg`,
        )
            .then(({ uri }) => {
                if (Platform.OS === 'android') {
                    Sharing.shareAsync(
                        uri,
                        {
                            mimeType: 'image/jpeg',
                            UTI: 'image/jpeg',
                        },
                    );
                } else {
                    ShareNative.share({
                        url: uri,
                    });
                }
            })
            .catch((error) => {
                logger.error('album-export', error);
            });
    })

    _pageSelected = (page) => this.setState({ selectedIndex: page });

    _preview = ({ image, ...props }) => {
        return (
            <ProgressiveImage
                thumbnailSource={{
                    uri: image.source.preview,
                }}

                source={{
                    uri: image.source.uri,
                }}

                {...props}
            />
        );
    }

    render() {
        const { album } = this.props.navigation.state.params as IAlbumParams;

        return (
            <Query<Album, AlbumVariables>
                query={GetAlbumQuery}
                fetchPolicy={this.props.fetchPolicy}
                variables={{
                    id: album,
                }}
            >
                {({ loading, error, data, refetch }) => {
                    if (error) throw new QueryFailedError(error);
                    this.data = data;

                    return (
                        <>
                            <ScreenWithHeader
                                header={{
                                    title: data != null && data.Album != null ? data.Album.name : I18N.Screen_Album.title,
                                    showBack: true,
                                }}
                            >
                                <FlatList
                                    contentContainerStyle={styles.container}
                                    data={mapResults(data)}
                                    numColumns={4}

                                    refreshing={loading}
                                    onRefresh={refetch}

                                    renderItem={this._renderItem}
                                    keyExtractor={this._key}
                                />
                            </ScreenWithHeader>


                            {this.state.viewGallery &&
                                <Portal>
                                    <StatusBar hidden={true} />
                                    <Gallery
                                        style={{ flex: 1, backgroundColor: this.props.theme.colors.backdrop }}
                                        images={mapResults(data)}

                                        onPageSelected={this._pageSelected}
                                        onSingleTapConfirmed={this._toggleButtons}
                                        initialPage={this.state.selectedIndex}
                                        imageComponent={this._preview}

                                        flatListProps={{
                                            windowSize: 3, // limits memory usage to 3 screens full of photos (ie. 3 photos)
                                            initialNumToRender: 3, // limit amount, must also be limited, is not controlled by other props
                                            maxToRenderPerBatch: 2, // when rendering ahead, how many should we render at the same time
                                            // initialScrollIndex: this.state.selectedIndex,
                                            // getItemLayout: (data, index) => ({ // fixes scroll and pinch behavior
                                            //   length: Dimensions.get('window').width,
                                            //   offset: Dimensions.get('window').width * index,
                                            //   index,
                                            // }),
                                        }}
                                    />

                                    {!this.state.hideButtons &&
                                        <>
                                            <IconButton
                                                icon="close"
                                                color={this.props.theme.colors.accent}
                                                onPress={this._hideGallery}
                                                style={{
                                                    position: 'absolute',
                                                    top: HEADER_MARGIN_TOP + 8,
                                                    left: 8,
                                                }}
                                            />

                                            <IconButton
                                                icon="share"
                                                onPress={this._export}
                                                color={this.props.theme.colors.accent}
                                                style={{
                                                    position: 'absolute',
                                                    top: HEADER_MARGIN_TOP + 8,
                                                    right: 8,
                                                }}
                                            />
                                        </>
                                    }
                                </Portal>
                            }
                        </>
                    );
                }}
            </Query>
        );
    }
}

const mapResults = memoize((data: Album | undefined) => data != null && data.Album != null
    ? data.Album.pictures.map((p) => ({
        source:
        {
            uri: encodeURI(p.preview_1920),
            preview: encodeURI(p.preview_100),
        },
    }))
    : []);

function memoize(func: (data: Album | undefined) => any) {
    let result;
    let cachedData: Album;

    return (newData: Album | undefined) => {
        // tslint:disable-next-line: triple-equals
        if (newData != null && (cachedData == null || newData.Album != cachedData.Album)) {
            logger.log('calculating new data');

            result = func(newData);
            cachedData = newData;
        }

        return result;
    };
}

// tslint:disable-next-line: export-name
export const AlbumScreen =
    withWhoopsErrorBoundary(
        withCacheInvalidation(
            'album',
            withTheme(AlbumScreenBase)));
