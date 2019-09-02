import { ConnectionInfo } from 'react-native';
import { AuthState } from './state/AuthState';
import { FilterState } from './state/FilterState';
import { LocationState } from './state/LocationState';
import { SearchHistoryState } from './state/SearchHistoryState';
import { SettingsState } from './state/SettingsState';
import { SnacksState } from './state/SnacksState';

export interface IAppState {
    connection: ConnectionInfo & { offline: boolean };

    updateAvailable: boolean;
    location: LocationState;

    searchHistory: SearchHistoryState;

    settings: SettingsState;
    snacks: SnacksState;

    filter: FilterState;

    auth: AuthState;
  // parameter: ParameterState,
}
