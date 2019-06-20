import React from 'react';
import { View } from 'react-native';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { showPictureSceen } from "../../redux/actions/navigation";

type AvatarPopupProps = {
    title: string,
    pic?: string,
    showPictureSceen: typeof showPictureSceen,
};

class AvatarPopupBase extends React.Component<AvatarPopupProps> {
    //@ts-ignore
    _showScreen = () => this.props.showPictureSceen(this.props.pic, this.props.title);

    render() {
        return (
            <TouchableWithoutFeedback
                disabled={this.props.pic == null || this.props.pic === ""}
                onPress={this._showScreen}
            >
                {/* Needs a view as child to trigger touch event */}
                <View>
                    {
                        React.cloneElement(this.props.children, { ...this.props })
                    }
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export const AvatarPopup = connect(null, { showPictureSceen })(AvatarPopupBase);
