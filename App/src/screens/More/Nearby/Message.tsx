import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../../theme/colors';
import { styles } from './styles';

export const Message = ({ text, theme, button, onPress }) => (
    <View style={styles.emptyContainer}>
        <Ionicons name="md-navigate" size={56 * 1.5} color={___DONT_USE_ME_DIRECTLY___COLOR_GRAY} />
        <Text style={styles.emptyText}>{text}</Text>

        {button &&
            <Button
                color={theme.colors.accent}
                onPress={onPress}
            >{button}</Button>
        }
    </View>
);