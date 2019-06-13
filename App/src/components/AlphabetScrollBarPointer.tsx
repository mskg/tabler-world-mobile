import React, { Component } from 'react';
import { View } from 'react-native';
import { Title } from 'react-native-paper';

type Props = {
    top: number,
    letter: string,
    style?: any
};

export class AlphabetSrollBarPointer extends Component<Props> {
    render() {
        return (
            <View
                style={[
                    {
                        ...styles.container,
                        top: this.props.top - 15,
                    },
                    this.props.style
                ]}
            >
                <Title style={styles.letter}>
                    {this.props.letter}
                </Title>
            </View>
        );
    }
}

const styles = {
    container: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        alignSelf: 'center',
        borderRadius: 50,
        width: 50,
        height: 50,
        zIndex: 999,

        right: 55
    },

    letter: {
        color: '#fff',
        alignSelf: 'center',
        textAlign: 'center',
    }
};
