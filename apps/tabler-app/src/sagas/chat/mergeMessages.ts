import { reverse, sortBy, uniqBy } from 'lodash';
import { ChatMessageEventId } from './ChatMessageEventId';
import { logger } from './logger';

export function mergeMessages<T extends { eventId: string, id: string }>(items: T[], list: T[], skipAdd = false): T[] {
    if (skipAdd) {
        const element = (list || []).find(
            (f) => f.id === items[0].id
                && f.eventId !== ChatMessageEventId.Failed
                && f.eventId !== ChatMessageEventId.Pending,
        );

        if (element != null) {
            logger.debug('skipping add', element);
            return list;
        }
    }

    // logger.debug('merging', items);

    return reverse(
        sortBy(
            // unique keeps the first occurence
            uniqBy(
                [
                    ...(items || []),
                    ...(list || []),
                ],
                (i) => i.id,
            ),
            // allows sorting
            (i) => i.eventId,
        ),
    );
}
