import React from 'react';
import { StyleSheet } from 'react-native';
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
        requestAnimationFrame(() => {
            if (this.props.pic) {
                this.props.showPictureSceen(this.props.pic, this.props.title);
            }
        });
    }

    render() {
        // tslint:disable-next-line: no-shadowed-variable
        const { title, pic, showPictureSceen, children, size, ...other } = this.props;

        return (
            // <Portal>
            <TouchableWithoutFeedback
                onPress={this._showScreen}
                disabled={pic == null || pic === ''}
                style={styles.container}
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

const styles = StyleSheet.create({
    container: {
        margin: 10,
    },
});
