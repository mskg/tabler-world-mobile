import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../theme/colors';
import { Element } from './Element';
import { styles } from './Styles';

export const SelectionList = ({ theme, field, items, value, onChange }) => {
    return <Element
        theme={theme}
        field={field}
        text={
            <RNPickerSelect
                items={items}
                placeholder={{}}
                value={value || ""}
                onValueChange={onChange}
                textInputProps={{
                    style: {
                        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
                        fontFamily: theme.fonts.regular
                    },
                    underlineColorAndroid: 'transparent',
                }}
                useNativeAndroidPickerStyle={false}
                style={{
                    viewContainer: styles.select,
                    inputIOSContainer: styles.selectContainer,
                }}
            />
        }
    />
}