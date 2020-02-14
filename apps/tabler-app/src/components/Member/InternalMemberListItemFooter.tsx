import React from 'react';
import { Card } from 'react-native-paper';
import { styles } from './Styles';

export class InternalMemberListItemFooter extends React.PureComponent {
    render() {
        return (
            <Card.Content style={styles.chipContainer}>
                {this.props.children}
            </Card.Content>
        );
    }
}
