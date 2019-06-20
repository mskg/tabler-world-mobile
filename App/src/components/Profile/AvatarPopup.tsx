import React from 'react';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { showPictureSceen } from "../../redux/actions/navigation";

type AvatarPopupProps = {
    title: string,
    size: number,
    pic?: string,
    showPictureSceen: typeof showPictureSceen,
    children: any,
};

class AvatarPopupBase extends React.Component<AvatarPopupProps> {
    //@ts-ignore
    _showScreen = () => {
        // debugger
        requestAnimationFrame(() =>
            this.props.showPictureSceen(this.props.pic, this.props.title)
        );
    }

    render() {
        const { title, pic, showPictureSceen, children, size, ...other } = this.props;

        return (
            // <Portal>
            <TouchableWithoutFeedback
                onPress={pic == null || pic === "" ? undefined : this._showScreen}
                style={{margin: 10}}
            >
                {
                    React.cloneElement(children, {
                        size,
                        ...other
                    })
                }
            </TouchableWithoutFeedback>
            // </Portal >
        );
    }
}

export const AvatarPopup = connect(null, { showPictureSceen })(AvatarPopupBase);
