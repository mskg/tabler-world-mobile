import { NativeModules } from 'react-native';

let getScheme = () => 'no-preference' as Schemes;

// we polyfill this if the module is not available
if (NativeModules.RNCAppearance != null) {
    // tslint:disable-next-line: no-var-requires
    const provider = require('react-native-appearance');
    getScheme = provider.Appearance.getColorScheme();
}

type Schemes = 'no-preference' | 'dark' | 'light';

export function getColorScheme(): Schemes {
    return getScheme() || 'no-preference';
}
