import { RecordType } from "../types/RecordType";

/**
 * Check if we have a valid ImportEvent
 */
export function validateImportEvent(playload: any) {
    if (playload == null) {
        throw new Error("Payload must not be null");
    }

    if (playload.type !== RecordType.tabler && playload.type !== RecordType.clubs) {
        throw new Error("Invalid type " + playload.type);
    }
}
