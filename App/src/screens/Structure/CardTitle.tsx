import * as React from 'react';
import { Card } from 'react-native-paper';
import AvatarText from '../../components/Club/ClubTextAvatar';
import { styles } from './Styles';

export function CardTitle({ avatar, title, subtitle }) {
    return <Card.Title
        title={title}
        subtitle={subtitle}

        titleStyle={styles.title}
        subtitleStyle={styles.title}

        style={{
            marginLeft: -4,
        }}

        left={
            (props) => <AvatarText
                {...props}
                size={50}
                label={avatar} />
        }
    />
}