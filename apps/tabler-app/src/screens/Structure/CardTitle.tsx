import * as React from 'react';
import AvatarText from '../../components/Club/ClubTextAvatar';
import { styles } from './Styles';
import { Card } from 'react-native-paper';

// tslint:disable-next-line: function-name
export function CardTitle({ avatar, title, subtitle }: { avatar: any, title: string, subtitle?: any }) {
    return (
        <Card.Title
            title={title}
            subtitle={subtitle}

            titleStyle={styles.title}
            subtitleStyle={styles.title}

            style={{
                marginLeft: -4,
            }}

            left={
                (props) => (
                    <AvatarText
                        {...props}
                        size={50}
                        label={avatar}
                    />
                )
            }
        />
    );
}
