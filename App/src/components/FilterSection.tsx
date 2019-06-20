import color from 'color';
import React from 'react';
import { StyleSheet, View } from "react-native";
import { Checkbox, Divider, Text, TouchableRipple } from 'react-native-paper';
import { Accordion } from "./Accordion";

export type FilterTagType = "area" | "role" | "table";

export type FilterTag = {
    type: FilterTagType,
    value: string,
};

const Element = ({ theme, title, onPress, right }: {
    theme, title, onPress, right?
}) => (
        <TouchableRipple
            style={{ backgroundColor: color(theme.colors.background).alpha(0.35).rgb().string() }}
            onPress={() => requestAnimationFrame(() => onPress())}>
            <View style={[styles.row]} pointerEvents="none">
                <Text style={{ width: MAX_WIDTH }} numberOfLines={1}>{title}</Text>
                {right}
            </View>
        </TouchableRipple>
    );

export const FilterSection = ({ title, data, type, filter, onToggle, theme }) => {
    if (data.length == 0) return (<React.Fragment key={type}></React.Fragment>);

    return (
        <Accordion
            key={type}
            title={title}
        >
            {
                data.map((tag, position) => {
                    const selected = !!filter.find((f: FilterTag) => f.type == type && f.value == tag)
                    return (
                        <React.Fragment key={type + tag}>
                            <Divider />
                            <Element
                                title={tag}
                                theme={theme}
                                onPress={() => onToggle(type, tag)}
                                right={
                                    <Checkbox.Android
                                        color={theme.colors.accent}
                                        status={selected ? 'checked' : 'unchecked'}
                                        onPress={() => { requestAnimationFrame(() => onToggle(type, tag)) }}
                                    />
                                }
                            />
                        </React.Fragment>

                        // <Chip
                        //     style={[{
                        //         marginHorizontal: 4,
                        //         marginVertical: 2,
                        //     },
                        //     selected ? { backgroundColor: theme.colors.accent } : null
                        //     ]}
                        //     onPress={() => requestAnimationFrame(() => onToggle(type, tag))}
                        //     selected={selected}
                        //     key={position}
                        // >
                        //     <Text style={{ fontSize: 11 }}>{tag}</Text>
                        // </Chip>
                    );
                })
            }
        </Accordion>
    );
}

const MAX_WIDTH = 250 - 32 - 16 - 32;
const styles = StyleSheet.create({
    row: {
        flex: 0,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // paddingVertical: 8,
        paddingLeft: 32,
        marginRight: 16,
        height: 50,
    },
});