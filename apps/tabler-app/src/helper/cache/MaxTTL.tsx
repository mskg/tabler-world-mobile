import { defaultParameters, TimeoutParameters } from '@mskg/tabler-world-config-app';
import { ParameterName } from '../../model/graphql/globalTypes';
import { getParameterValue } from '../parameters/getParameterValue';

export const MaxTTL = defaultParameters.timeouts;

export async function updateTimeouts() {
    const settings = await getParameterValue<TimeoutParameters>(ParameterName.timeouts);
    Object.assign(MaxTTL, settings);
}
