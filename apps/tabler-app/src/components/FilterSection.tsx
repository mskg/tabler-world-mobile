import color from 'color';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox, Divider, Text, TouchableRipple } from 'react-native-paper';
import { Accordion } from './Accordion';

export type FilterTagType = 'family' | 'area' | 'role' | 'table' | 'sector' | 'association';

export const SortMap = {
    family: 'A',
    association: 'B',
    area: 'C',
    table: 'D',
    role: 'E',
    sector: 'F',
}

export type FilterTag = {
    type: FilterTagType,
    value: string,
    id?: string,
};

const Element = ({ theme, title, onPress, right }: {
    theme, title, onPress, right?,
}) => (
        <TouchableRipple
            style={{ backgroundColor: color(theme.colors.background).alpha(0.35).rgb().string() }}
            onPress={() => requestAnimationFrame(() => onPress())}
        >
            <View style={[styles.row]} pointerEvents="none">
                <Text style={{ width: MAX_WIDTH }} numberOfLines={2}>{title}</Text>
                {right}
            </View>
        </TouchableRipple>
    );

export const FilterSection = (
    { title, data, type, filter, onToggle, theme },
) => {
    if (data.length === 0) return (<React.Fragment key={type} />);

    return (
        <Accordion
            key={type}
            title={title}
        >
            {
                data.map((value, _position) => {
                    const tag = typeof (value) === 'string' ? value : value.name;
                    const id = typeof (value) === 'string' ? null : value.id;

                    const selected = !!filter.find((f: FilterTag) => f.type === type && f.value === tag);
                    return (
                        <React.Fragment key={type + tag}>
                            <Divider />
                            <Element
                                title={tag}
                                theme={theme}
                                onPress={() => onToggle(type, tag, id)}
                                right={(
                                    <Checkbox.Android
                                        color={theme.colors.accent}
                                        status={selected ? 'checked' : 'unchecked'}
                                        onPress={() => { requestAnimationFrame(() => onToggle(type, tag, id)); }}
                                    />
                                )}
                            />
                        </React.Fragment>
                    );
                })
            }
        </Accordion>
    );
};

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
