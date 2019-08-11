import React from 'react';
import { WebScreen } from '../../components/WebScreen';
import { getConfigValue } from '../../helper/Configuration';
import { I18N } from '../../i18n/translation';

const world = getConfigValue("feedback");
export const FeedbackScreen = () => <WebScreen showBack={true} url={world} title={I18N.Feedback.title} />;
