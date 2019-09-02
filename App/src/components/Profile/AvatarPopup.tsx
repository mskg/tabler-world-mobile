import React from 'react';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import { connect } from 'react-redux';
import { showPictureSceen } from '../../redux/actions/navigation';

type AvatarPopupProps = {
    title: string,
    size?: number,
    pic?: string | null,
    showPictureSceen: typeof showPictureSceen,
    children: any,
};

class AvatarPopupBase extends React.Component<AvatarPopupProps> {
    _showScreen = () => {
        requestAnimationFrame(() =>
            // @ts-ignore
            this.props.showPictureSceen(this.props.pic, this.props.title),
        );
    }

    render() {
        const { title, pic, showPictureSceen, children, size, ...other } = this.props;

        return (
            // <Portal>
            <TouchableWithoutFeedback
                onPress={pic == null || pic === '' ? undefined : this._showScreen}
                disabled={pic == null || pic === ''}
                style={{ margin: 10 }}
            >
                {
                    React.cloneElement(children, {
                        size,
                        ...other,
                    })
                }
            </TouchableWithoutFeedback>
            // </Portal >
        );
    }
}

export const AvatarPopup = connect(null, { showPictureSceen })(AvatarPopupBase);
