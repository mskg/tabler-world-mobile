import color from 'color';
import { Theme } from 'react-native-paper';
import { ___DONT_USE_ME_DIRECTLY___COLOR_41I, ___DONT_USE_ME_DIRECTLY___COLOR_LCI, ___DONT_USE_ME_DIRECTLY___COLOR_RTI } from './colors';

type Families = 'rti' | 'lci' | 'c41';

const FAMILIY_COLORS = {
    rti: ___DONT_USE_ME_DIRECTLY___COLOR_RTI,
    lci: ___DONT_USE_ME_DIRECTLY___COLOR_LCI,
    c41: ___DONT_USE_ME_DIRECTLY___COLOR_41I,
};

const IS_DARK = {
    rti: color(___DONT_USE_ME_DIRECTLY___COLOR_RTI).isDark(),
    lci: color(___DONT_USE_ME_DIRECTLY___COLOR_LCI).isDark(),
    c41: color(___DONT_USE_ME_DIRECTLY___COLOR_41I).isDark(),
};

export function getFamilyColor(family: Families): string {
    return FAMILIY_COLORS[family];
}

export function getTextColor(family: Families, theme: Theme): string {
    return IS_DARK[family]
        ? '#ffffff'
        : theme.colors.text;
}
