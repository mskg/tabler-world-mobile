import { Platform } from 'react-native';
import { IAddress } from '../model/IAddress';
import { OpenLink } from './OpenLink';
import { formatRoutableAddress } from './formatting/formatRoutableAddress';

export function showAddress(address?: IAddress | null) {
    const addr = formatRoutableAddress(address);
    if (addr == null) {
        return;
    }
    // needs rework #30
    const url = Platform.OS === 'ios'
        ? 'http://maps.apple.com/?q='
        : 'https://www.google.com/maps/search/?api=1&query=';

    OpenLink.url(url + encodeURIComponent(addr));
}
