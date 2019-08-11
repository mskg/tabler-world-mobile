import React from 'react';
import { WebScreen } from '../../components/WebScreen';
import { getConfigValue } from '../../helper/Configuration';
import { I18N } from '../../i18n/translation';

const world = getConfigValue("world");
export const WorldScreen = () => <WebScreen showBack={true} url={world} title={I18N.World.title} />;
