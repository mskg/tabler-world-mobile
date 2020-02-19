import React from 'react';
import RNPickerSelect from 'react-native-picker-select';
import { ___DONT_USE_ME_DIRECTLY___COLOR_GRAY } from '../../../theme/colors';
import { Element } from './Element';
import { styles } from './Styles';

type Props = { theme, field, items, value, onChange, onClose?};

export const SelectionList = ({ theme, field, items, value, onChange, onClose }: Props) => {
    return <Element
        theme={theme}
        field={field}
        text={
            <RNPickerSelect
                items={items}
                placeholder={{}}
                value={value || ''}
                onValueChange={onChange}
                onClose={onClose}
                textInputProps={{
                    style: {
                        color: ___DONT_USE_ME_DIRECTLY___COLOR_GRAY,
                        fontFamily: theme.fonts.regular,
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
    />;
};
