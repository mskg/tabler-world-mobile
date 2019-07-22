import { ScreenOrientation } from 'expo';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import React from 'react';
import { Query } from 'react-apollo';
import { Dimensions, FlatList, Platform, SafeAreaView, Share as ShareNative, StatusBar, StyleSheet, View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Gallery from 'react-native-image-gallery';
import { FAB, IconButton, Portal, Theme, withTheme } from 'react-native-paper';
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
import { GetAlbumQuery } from '../../queries/GetAlbumQuery';
import { IAlbumParams } from '../../redux/actions/navigation';
import { logger } from './logger';
import ProgressiveImage from './ProgressiveImage';
import { styles } from './Styles';

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
    const item: Album_Album_pictures = params.item;

    return (
      <TouchableWithoutFeedback onPress={() => this.setState({ viewGallery: true, hideButtons: false, selectedIndex: params.index }, () => ScreenOrientation.unlockAsync())}>
        <View style={styles.imageContainer}>

          <View style={styles.imageThumbnail}>
            <CachedImage
              resizeMode="cover"
              preview={
                // android doesn't like the animation here?
                Platform.OS == "android" ? undefined :
                  <Placeholder ready={false} previewComponent={
                    <Square width={Dimensions.get("screen").width / 4 - 3} />
                  }
                  />
              }
              uri={item.preview_100}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    );
  }

  _key = (item: Album_Album_pictures, index: number) => {
    return index.toString();
  }

  _toggleButtons = () => requestAnimationFrame(() => this.setState(
      { hideButtons: !this.state.hideButtons }));

  _hideGallery = () => requestAnimationFrame(() => this.setState(
    { viewGallery: false },
    () => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP)));

  _export = () => requestAnimationFrame(() => {
    if (!this.data || !this.data.Album) return;

    const source = this.data.Album.pictures[this.state.selectedIndex].preview_1920;

    FileSystem.downloadAsync(
      source,
      FileSystem.cacheDirectory + 'share.jpeg'
    )
      .then(({ uri }) => {
        console.log('Finished downloading to ', uri);

        if (Platform.OS === "android") {
          Sharing.shareAsync(
            uri,
            {
              mimeType: "image/jpeg",
              UTI: "image/jpeg",
            }
          );
        } else {
          ShareNative.share({
            url: uri,
          });
        }
      })
      .catch(error => {
        console.error(error);
      });
  });

  _pageSelected = (page) => this.setState({ selectedIndex: page });

  _preview = ({ image, ...props }) => {
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
                  <StatusBar hidden={true} />
                  <Gallery
                    style={{ flex: 1, backgroundColor: this.props.theme.colors.backdrop, }}
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
                      //   length: Dimensions.get('screen').width,
                      //   offset: Dimensions.get('screen').width * index,
                      //   index,
                      // }),
                    }}
                  />

                  {!this.state.hideButtons &&
                    <>
                      <SafeAreaView style={[StyleSheet.absoluteFill, {
                        alignItems: "flex-start",
                        padding: 8,
                      }]}>
                        <IconButton
                          icon="close"
                          color={this.props.theme.colors.accent}
                          onPress={this._hideGallery}
                        />
                      </SafeAreaView>

                      <SafeAreaView style={[StyleSheet.absoluteFill, {
                        alignItems: "flex-end",
                        justifyContent: "flex-end",
                        padding: 16,
                      }]}>
                        <FAB icon="share" onPress={this._export} />
                      </SafeAreaView>
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

const mapResults = memoize((data: Album) => data != null && data.Album != null
  ? data.Album.pictures.map(p => ({
    source:
    {
      uri: encodeURI(p.preview_1920),
      preview: encodeURI(p.preview_100),
    }
  }))
  : []);

function memoize(func: (data: any) => any) {
  let result;
  let cachedData;

  return (newData: any) => {
    if (newData != cachedData) {
      logger.log("calculating new data");

      result = func(newData);
      cachedData = newData;
    }

    return result;
  }
}

export const AlbumScreen =
  withWhoopsErrorBoundary(
    withCacheInvalidation("album",
      withTheme(AlbumScreenBase)));