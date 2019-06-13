import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from "react-native";
import { Divider, IconButton, Theme, TouchableRipple } from 'react-native-paper';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../theme/colors';
import { styles } from './Styles';

type SectionProps = {
    theme: Theme,
    children: any,
    icon: string,

    onPress?: () => void,
    disableRipple?: boolean,

    highlight?: boolean,

    secondIcon?: string,
    secondPress?: () => void,
}

const VOID = () => { };
const withAnimation = (func) => () => requestAnimationFrame(func || VOID);

export const Section = ({ theme, children, icon, onPress, disableRipple, secondIcon, secondPress, highlight }: SectionProps) => {
    return (
        <>
            <TouchableRipple disabled={disableRipple === true} onPress={withAnimation(onPress)}>
                <View style={[styles.section,]}>
                    <View style={styles.sectionIcon}>
                        <IconButton
                            icon={() => <Ionicons
                                name={icon}
                                size={24}
                                color={onPress || highlight === true ? theme.colors.accent : ___DONT_USE_ME_DIRECTLY___COLOR_GRAY}
                            />}
                            onPress={onPress ? withAnimation(onPress) : undefined}
                        />
                    </View>
                    <View style={styles.sectionElements}>
                        {children}
                    </View>

                    {(secondIcon && secondPress) &&
                        <View style={styles.sectionSecondIcon}>
                            <IconButton
                                icon={() => <Ionicons
                                    name={secondIcon}
                                    size={24}
                                    color={secondPress ? theme.colors.accent : ___DONT_USE_ME_DIRECTLY___COLOR_GRAY}
                                />}
                                onPress={withAnimation(secondPress)}
                            />
                        </View>
                    }
                </View>
            </TouchableRipple>

            <Divider style={styles.divider} />
        </>
    );
}
