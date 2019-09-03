import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import { Text, TouchableRipple } from 'react-native-paper';

export const ActionButton = ({ size, color, disabledColor, icon, text, disabled, onPress }) => (
    <TouchableRipple
        disabled={disabled}
        onPress={disabled ? null : onPress}
        onLongPress={disabled ? null : onPress}
        style={{
            borderRadius: size,
            width: size * 2,
            height: size * 2,
        }}
    >
        <View
            style={
                {
                    justifyContent: 'center',
                    alignItems: 'center',
                }
            }>
            {icon !== '' && typeof (icon) === 'string' &&
                <Ionicons name={icon} size={size} color={!disabled ? color : disabledColor} />
            }

            {text &&
                <Text
                    style={{
                        color: !disabled ? color : disabledColor,
                        fontSize: 12,
                        paddingTop: 4,
                    }}
                >{text}
                </Text>
            }
        </View>
    </TouchableRipple>
);
