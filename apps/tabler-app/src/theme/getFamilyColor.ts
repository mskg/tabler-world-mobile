import color from 'color';
import { Theme } from 'react-native-paper';
import { ___DONT_USE_ME_DIRECTLY___COLOR_41I, ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP, ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR_41I, ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR_LCI, ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR_RTI, ___DONT_USE_ME_DIRECTLY___COLOR_LCI, ___DONT_USE_ME_DIRECTLY___COLOR_RTI } from './colors';

export type Families = 'rti' | 'lci' | 'c41';

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

const NAVIGATION_COLORS = {
    rti: ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR_RTI,
    lci: ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR_LCI,
    c41: ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR_41I,
};

const BACKDROP_COLORS = {
    rti: ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP,
    lci: ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP,
    c41: ___DONT_USE_ME_DIRECTLY___COLOR_BACKDROP,
};

export function getNavigationColor(family: Families): string {
    return NAVIGATION_COLORS[family];
    // return ___DONT_USE_ME_DIRECTLY___COLOR_BOTTOM_BAR;
}

export function getFamilyColor(family: Families): string {
    return FAMILIY_COLORS[family];
}

export function getBackdropColor(family: Families): string {
    return BACKDROP_COLORS[family];
}

export function getTextColor(family: Families, theme: Theme): string {
    return IS_DARK[family]
        ? '#ffffff'
        : theme.colors.text;
}
