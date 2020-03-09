import { $$asyncIterator } from 'iterall';

type FilterFn = (rootValue?: any, args?: any, context?: any, info?: any) => boolean | Promise<boolean>;
type ResolverFn = (rootValue?: any, args?: any, context?: any, info?: any) => AsyncIterator<any>;

/**
 * We nedd to have our own implementation to filter 'no matches'
 *
 * @param asyncIteratorFn
 * @param filterFn
 */
export const withFilter = (asyncIteratorFn: ResolverFn, filterFn: FilterFn): ResolverFn => {
    return (rootValue: any, args: any, context: any, info: any): AsyncIterator<any> => {
        const asyncIterator = asyncIteratorFn(rootValue, args, context, info);

        const getNextPromise = () => {
            return asyncIterator
                .next()
                .then((payload: any) => {
                    if (payload.done === true) {
                        return payload;
                    }

                    return Promise.resolve(filterFn(payload.value, args, context, info))
                        .catch(() => false)
                        .then((filterResult) => {

                            if (filterResult) {
                                return payload;
                            }

                            // we return null that means skip for our publish lambda
                            return { done: true, value: null };
                        });
                });
        };

        return {
            next() {
                return getNextPromise();
            },

            return() {
                // @ts-ignore
                return asyncIterator.return();
            },

            throw(error) {
                // @ts-ignore
                return asyncIterator.throw(error);
            },

            // tslint:disable-next-line: function-name
            // @ts-ignore
            [$$asyncIterator]() {
                return this;
            },
        };
    };
};
