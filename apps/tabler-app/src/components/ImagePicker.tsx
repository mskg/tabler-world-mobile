import { Ionicons } from '@expo/vector-icons';
import { Camera, Constants } from 'expo-camera';
import { CapturedPicture } from 'expo-camera/build/Camera.types';
import * as ExpoImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import React from 'react';
import { StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Text, Theme, withTheme } from 'react-native-paper';
import { isIphoneX } from '../helper/isIphoneX';
import { I18N } from '../i18n/translation';
import { FullScreenLoading } from './Loading';

type Props = {
    theme: Theme,

    onClose?: () => void;
    onCameraPictureSelected?: (photo: CapturedPicture) => void;
    onGalleryPictureSelected?: (photo: ExpoImagePicker.ImagePickerResult) => void;
};

type State = {
    hasPermission?: boolean,
    cameraType: Constants.Type,
};

class ImagePickerBase extends React.Component<Props, State> {
    camera!: Camera | null;

    state: State = {
        cameraType: Constants.Type.back,
    };

    componentDidMount() {
        this.getPermissionAsync();
    }

    async getPermissionAsync() {
        // Camera Permission
        const { status } = await Camera.requestPermissionsAsync();
        this.setState({ hasPermission: status === 'granted' });
    }

    _close = () => {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    _handleCameraType = () => {
        const { cameraType } = this.state;

        this.setState({
            cameraType:
                cameraType === Constants.Type.back
                    ? Constants.Type.front
                    : Constants.Type.back,
        });
    }

    _takePicture = async () => {
        if (this.camera) {
            const photo = await this.camera.takePictureAsync({
                exif: false,
                base64: false,
                skipProcessing: true,
            });

            if (this.props.onCameraPictureSelected) {
                this.props.onCameraPictureSelected(photo);
            }
        }

        requestAnimationFrame(() =>
            this._close(),
        );
    }

    _pickImage = async () => {
        const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);

        if (status !== 'granted') {
            alert(I18N.Component_ImagePicker.nogallery);
            return;
        }

        const photo = await ExpoImagePicker.launchImageLibraryAsync({
            mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            allowsMultipleSelection: false,
            exif: false,
            base64: false,
        });

        if (!photo.cancelled && this.props.onGalleryPictureSelected) {
            this.props.onGalleryPictureSelected(photo);
        }

        requestAnimationFrame(() =>
            this._close(),
        );
    }

    render() {
        const { hasPermission } = this.state;
        if (hasPermission === null) {
            return (<FullScreenLoading />);
        }

        // if (hasPermission === false) {
        //     return (
        //         <EmptyComponent title={I18N.Component_ImagePicker.nocamera} />
        //     );
        // }

        return (
            <View style={{ flex: 1 }}>
                <StatusBar hidden={true} />
                <Camera
                    style={{ flex: 1 }}
                    type={this.state.cameraType}
                    ref={(ref) => { this.camera = ref; }}
                    zoom={0}
                >
                    <View
                        style={styles.topBar}
                    >
                        <TouchableOpacity
                            style={styles.touchable}
                            onPress={this._close}
                        >
                            <Ionicons
                                name="md-close"
                                style={styles.closeButton}
                            />
                        </TouchableOpacity>
                    </View>

                    {!hasPermission && (
                        <View style={styles.permissionContainer}>
                            <Text style={styles.permissionText}>{I18N.Component_ImagePicker.nocamera}</Text>
                        </View>
                    )}

                    <View
                        style={styles.bottomBar}
                    >
                        <View
                            style={styles.bottomBarContainer}
                        >
                            <TouchableOpacity
                                style={styles.touchable}
                                onPress={this._pickImage}
                            >
                                <Ionicons
                                    name="md-images"
                                    style={styles.smallButton}
                                />
                            </TouchableOpacity>

                            {hasPermission && (
                                <TouchableOpacity
                                    style={styles.touchable}
                                    onPress={this._takePicture}
                                >
                                    <Ionicons
                                        name="ios-radio-button-on"
                                        style={styles.largeButton}
                                    />
                                </TouchableOpacity>
                            )}

                            {hasPermission && (
                                <TouchableOpacity
                                    style={styles.touchable}
                                    onPress={this._handleCameraType}
                                >
                                    <Ionicons
                                        name="ios-reverse-camera"
                                        style={styles.smallButton}
                                    />
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </Camera>
            </View >
        );
    }
}

export const ImagePicker = withTheme(ImagePickerBase);

const styles = StyleSheet.create({
    permissionContainer: {
        flex: 1,
        // height: Dimensions.get('window').height,
        alignItems: 'center',
        justifyContent: 'center',

        marginHorizontal: 16,
    },

    permissionText: {
        fontSize: 30,
        textAlign: 'center',
        color: 'white',
    },

    topBar: {
        flex: 1,
        alignItems: 'flex-start',
        flexDirection: 'row',
        justifyContent: 'flex-start',
        margin: 30,
        marginTop: isIphoneX() ? 50 : 30,
    },

    bottomBar: {
        flex: 1,
        alignItems: 'flex-end',
        flexDirection: 'row',
        marginBottom: 30,
    },

    bottomBarContainer: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },

    touchable: {
        backgroundColor: 'transparent',
    },

    closeButton: {
        color: '#fff',
        fontSize: 30,
    },

    smallButton: {
        color: '#fff',
        fontSize: 40,
    },

    largeButton: {
        color: '#fff',
        fontSize: 70,
    },
});
