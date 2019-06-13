import { AuthState } from './state/AuthState';
import { FilterState } from './state/FilterState';
import { SearchHistoryState } from './state/SearchHistoryState';
import { SettingsState } from './state/SettingsState';
import { SnacksState } from './state/SnacksState';

export interface IAppState {
  updateAvailable: boolean,
  // offline: OfflineState,

  searchHistory: SearchHistoryState,

  settings: SettingsState,
  snacks: SnacksState,

  filter: FilterState,

  auth: AuthState,
};