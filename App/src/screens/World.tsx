import Constants from 'expo-constants';
import React from 'react';
import { WebScreen } from '../components/WebScreen';
import { I18N } from '../i18n/translation';

const extra = Constants.manifest.extra || {};
const { world } = extra;

export const WorldScreen = () => <WebScreen url={world} title={I18N.World.title} />;
