import { filter, find, orderBy } from 'lodash';
import { normalizeForSearch } from './normalizeForSearch';

function makeNormalizedSearchFunc(search: string) {
    return (target: string) => {
        const segments = normalizeForSearch(search).split(' ');
        const changedTarget = normalizeForSearch(target);

        let found = false;
        for (const segment of segments) {
            if (changedTarget.indexOf(segment) < 0) {
                return false;
            }

            found = true;
        }

        return found;
    };
}

type MakeSearchTextFunc<T> = (c: T) => string[];
type PreFilterFunc<T> = (c: T) => boolean;
type OrderByFunc<T> = (c: T) => any;
type MatchedData<T> = ({ match?: string } & T | null)[];

/**
 * Filter and sort a given array
 *
 * @param extractText function to extract an array of searchable texts
 * @param data the array to operatee on
 * @param text text so search
 * @param preFilter pre filtering
 * @param orderByFunc post ordering
 */
export function filterData<T>(
    extractText: MakeSearchTextFunc<T>,
    data?: T[] | null,
    text?: string,
    preFilter?: PreFilterFunc<T>,
    orderByFunc?: OrderByFunc<T>,
): T[] {
    if (data == null) { return []; }

    const normalizedSearch = makeNormalizedSearchFunc(text || '');

    let processedData: MatchedData<T> = data;
    if (preFilter) { processedData = filter(processedData as T[], preFilter); }

    // this will match everything
    if (text != null && text !== '') {
        processedData = filter(
            processedData.map((item) => {
                // this is only requried for the compiler
                if (!item) { return null; }

                const match = find(
                    extractText(item),
                    normalizedSearch);

                return match
                    ? {
                        ...item,
                        match,
                    }
                    : null;
            }),
            (i) => i != null,
        );
    }

    if (orderByFunc) { processedData = orderBy(processedData, orderByFunc) as T[]; }

    // ok to cast, null values have been filtered
    return processedData as T[];
}
