import { CONFIGURATIONS } from '../Configurations';
import { AnyOperationMode } from '../types/AnyOperationMode';
import { ChangePointer } from '../types/ChangePointer';
import { CompressedContinueEvent, ContinueEvent } from '../types/ContinueEvent';
import { ImportEvent } from '../types/ImportEvent';
import { OperationMode } from '../types/OperationMode';
import { gunzipAsync } from './gzip';
import { validateImportEvent } from './validateImportEvent';

export async function setupJobContext(rawEvent: ImportEvent | ContinueEvent | CompressedContinueEvent) {
    let event: ImportEvent;

    const changePointer: ChangePointer[] = [];
    let totalProcessedRecords = 0;
    let totalTime = 0;
    let recursionLevel = 0;

    if (rawEvent.type === 'continue' || rawEvent.type === 'c') {
        let continueEvent: ContinueEvent = rawEvent as ContinueEvent;

        if (rawEvent.type === 'c') {
            const data = await gunzipAsync(Buffer.from(rawEvent.d, 'binary'));
            continueEvent = JSON.parse(data.toString());
        }

        // we initialize from existing time
        event = continueEvent.event;

        changePointer.push(...continueEvent.changes);
        totalProcessedRecords += continueEvent.log.records;
        totalTime = continueEvent.log.elapsedTime;
        recursionLevel = continueEvent.log.calls;
    } else {
        event = rawEvent;
    }

    validateImportEvent(event);

    let activeMode: AnyOperationMode = OperationMode.full;
    if (event.mode != null) {
        activeMode = event.mode;
    }

    const activeConfiguration = CONFIGURATIONS[event.type][activeMode];
    if (activeConfiguration == null) {
        throw new Error(`Unknown mode ${activeMode}`);
    }

    const jobName = `update::${event.type}::${activeMode}::${recursionLevel}`;

    return {
        event,
        jobName,

        changePointer,

        totalProcessedRecords,
        totalTime,
        recursionLevel,

        configuration: {
            url: activeConfiguration.url,
            method: activeConfiguration.method,
            payload: activeConfiguration.payload(),
        },
    };
}
