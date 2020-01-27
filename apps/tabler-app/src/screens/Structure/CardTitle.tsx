import * as React from 'react';
import { Card } from 'react-native-paper';
import AvatarText from '../../components/Club/ClubTextAvatar';
import { styles } from './Styles';

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
                typeof (avatar) !== 'object'
                    ? (props) => (
                        <AvatarText
                            {...props}
                            size={50}
                            label={avatar}
                        />
                    )
                    : () => avatar
            }
        />
    );
}
