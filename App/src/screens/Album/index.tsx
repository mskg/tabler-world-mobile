import { ScreenOrientation } from 'expo';
import * as FileSystem from 'expo-file-system';
import React from 'react';
import { Query } from 'react-apollo';
import { Dimensions, FlatList, Image, Share as ShareNative, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Gallery from 'react-native-image-gallery';
import { Portal, Theme, withTheme } from 'react-native-paper';
import { NavigationInjectedProps } from 'react-navigation';
import { AuditedScreen } from '../../analytics/AuditedScreen';
import { AuditPropertyNames } from '../../analytics/AuditPropertyNames';
import { AuditScreenName } from '../../analytics/AuditScreenName';
import { withWhoopsErrorBoundary } from '../../components/ErrorBoundary';
import { ScreenWithHeader } from '../../components/Screen';
import { withCacheInvalidation } from '../../helper/cache/withCacheInvalidation';
import { Categories, Logger } from "../../helper/Logger";
import { I18N } from '../../i18n/translation';
import { Album, AlbumVariables, Album_Album_pictures } from '../../model/graphql/Album';
import { GetAlbumQuery } from '../../queries/GetAlbumQuery';
import { IAlbumParams } from '../../redux/actions/navigation';
import ProgressiveImage from './ProgressiveImage';
import { styles } from './Styles';

const logger = new Logger(Categories.Screens.Albums);

type State = {
  viewGallery: boolean,
  selectedIndex: number,
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
    };
  }

  componentDidMount() {
    const { album } = this.props.navigation.state.params as IAlbumParams;

    this.audit.submit({
      [AuditPropertyNames.Album]: album.toString(),
    });

  }

  _renderItem = (params) => {
    const item: Album_Album_pictures = params.item;

    return (
      <TouchableWithoutFeedback onPress={() => this.setState({ viewGallery: true, selectedIndex: params.index }, () => ScreenOrientation.unlockAsync())}>
        <View style={styles.imageContainer}>
          <Image style={styles.imageThumbnail} resizeMode="cover" source={{ uri: item.preview_100 }} />
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _key = (item: Album_Album_pictures, index: number) => {
    return index.toString();
  }

  _singleTap = () => this.setState(
    { viewGallery: false },
    () => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP));

  _longPress = () => {
    if (!this.data || !this.data.Album) return;

    const source = this.data.Album.pictures[this.state.selectedIndex].preview_1920;

    FileSystem.downloadAsync(
      source,
      FileSystem.cacheDirectory + 'share.jpeg'
    )
      .then(({ uri }) => {
        console.log('Finished downloading to ', uri);

        ShareNative.share({
          url: uri,
        });
        // Sharing.shareAsync(uri, {
        //   mimeType: 'image/jpeg',
        //   UTI: 'JPEG',
        // });
      })
      .catch(error => {
        console.error(error);
      });
  };

  _pageSelected = (page) => this.setState({ selectedIndex: page });

  _preview = ({image, ...props}) => {
    // console.log(image);

    return <ProgressiveImage
      thumbnailSource={{
        uri: image.source.preview
      }}

      source={{
        uri: image.source.uri
      }}

      {...props} />
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
          if (error) throw error;
          this.data = data;

          return (
            <>
              <ScreenWithHeader header={{
                title: data != null && data.Album != null ? data.Album.name : I18N.Album.title,
                showBack: true,
              }}
              >
                <FlatList
                  contentContainerStyle={styles.container}
                  //@ts-ignore
                  data={data != null && data.Album != null ? data.Album.pictures : []}
                  numColumns={4}

                  refreshing={loading}
                  onRefresh={refetch}

                  renderItem={this._renderItem}
                  keyExtractor={this._key}
                />
              </ScreenWithHeader>


              {this.state.viewGallery &&
                <Portal>
                  <View style={{ flex: 1 }} >
                    <Gallery
                      style={{ flex: 1, backgroundColor: this.props.theme.colors.backdrop }}
                      images={
                        data != null && data.Album != null
                          ? data.Album.pictures.map(p => ({
                            source:
                            {
                              uri: p.preview_1920,
                              preview: p.preview_100,
                            }
                          }))
                          : []
                      }

                      onPageSelected={this._pageSelected}
                      onSingleTapConfirmed={this._singleTap}
                      initialPage={this.state.selectedIndex}
                      onLongPress={this._longPress}
                      imageComponent={this._preview}

                      flatListProps={{
                        windowSize: 3, // limits memory usage to 3 screens full of photos (ie. 3 photos)
                        initialNumToRender: 3, // limit amount, must also be limited, is not controlled by other props
                        maxToRenderPerBatch: 2, // when rendering ahead, how many should we render at the same time
                        getItemLayout: (data, index) => ({ // fixes scroll and pinch behavior
                          length: Dimensions.get('screen').width,
                          offset: Dimensions.get('screen').width * index,
                          index,
                        }),
                      }}
                    />
                  </View>
                </Portal>
              }
            </>
          );
        }}
      </Query>
    );
  }
}

export const AlbumScreen =
  withWhoopsErrorBoundary(
    withCacheInvalidation("album",
      withTheme(AlbumScreenBase)));