import { defaultDataIdFromObject, InMemoryCache, IntrospectionFragmentMatcher } from 'apollo-cache-inmemory';

const fragmentMatcher = new IntrospectionFragmentMatcher({
    introspectionQueryResultData:
    {
        ['__schema']: {
            types: [
                {
                    kind: 'INTERFACE',
                    name: 'MemberListView',
                    possibleTypes: [
                        {
                            name: 'Member',
                        },
                    ],
                },
            ],
        },
    },
});

export const cache = new InMemoryCache({
    fragmentMatcher,

    dataIdFromObject: object => {
        switch (object.__typename) {
            // has an id field, but that is not a unique id
        case 'RoleRef':
            return null;

        case 'Parameter':
                // @ts-ignore
            if (object.name == null) return defaultDataIdFromObject(object);
                // @ts-ignore
            return `${object.__typename}:${object.name}`;

        case 'Association':
                // @ts-ignore
            if (object.association == null) return defaultDataIdFromObject(object);
                // @ts-ignore
            return `${object.__typename}:${object.association}`;

        default:
            return defaultDataIdFromObject(object); // fall back to default handling
        }
    },

    cacheRedirects: {
        Query: {
            NewsArticle: (_, args, { getCacheKey }) =>
                getCacheKey({ __typename: 'NewsArticle', id: args.id }),

            Club: (_, args, { getCacheKey }) =>
                getCacheKey({ __typename: 'Club', id: args.id }),

            Member: (_, args, { getCacheKey }) =>
                getCacheKey({ __typename: 'Member', id: args.id }),

            Members: (_, args, { getCacheKey }) =>
                args.ids.map(id =>
                    getCacheKey({ __typename: 'Member', id })),
        },
    },
});
