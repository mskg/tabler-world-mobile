import React from 'react';
import { View } from 'react-native';
import { Theme, TouchableRipple } from 'react-native-paper';
import { CardTitle } from './CardTitle';
import { styles } from './Styles';

type Props = {
    theme: Theme,
    title: any,
    subtitle: any,

    left: (props: { size: number; }) => React.ReactNode;
    right: (props: { size: number; }) => React.ReactNode;

    bottom: () => React.ReactNode;
    onPress: () => void;

    height?: number,
};

export class InternalMemberListItem extends React.PureComponent<Props> {
    render() {
        const { title, subtitle } = this.props;

        return (
            <View
                style={{
                    height: this.props.height,
                    backgroundColor: this.props.theme.colors.surface,
                }}
            >
                <TouchableRipple
                    onPress={this.props.onPress}
                    style={{
                        height: this.props.height,
                        margin: 0,
                        padding: 0,
                    }}
                >
                    <>
                        <CardTitle
                            style={styles.cardTitle || ''}
                            title={title}
                            titleStyle={styles.titleContainer}

                            subtitle={subtitle || ''}
                            subtitleStyle={styles.subTitleContainer}

                            left={this.props.left}
                            right={this.props.right}
                        />

                        {this.props.bottom && this.props.bottom()}
                    </>
                </TouchableRipple>
            </View>
        );
    }
}
