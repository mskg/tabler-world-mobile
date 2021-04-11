import * as Linking from 'expo-linking';

type QueryParams = {
    [key: string]: string | undefined;
};

type ParsedURL = {
    scheme: string | null;
    hostname: string | null;
    path: string | null;
    queryParams: QueryParams | null;
};

export function parseLink(url: string): ParsedURL {
    const { hostname, scheme, path, queryParams } = Linking.parse(url);

    // workarround https://github.com/expo/expo/issues/6497
    return {
        scheme,
        hostname,
        queryParams,
        path: path || hostname,
    };
}
