import { ParameterName } from '../../model/graphql/globalTypes';
import { getParameterValue } from '../parameters/getParameterValue';
import { TimeoutDefaults, TimeoutParameters } from '../parameters/Timeouts';

export let MaxTTL = TimeoutDefaults;

export async function updateTimeouts() {
    const settings = await getParameterValue<TimeoutParameters>(ParameterName.timeouts);
    MaxTTL = settings;
}
